import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';

interface CineVideoPlayerProps {
  videoUrl?: string; // Direct HLS link (.m3u8)
  embedUrl?: string; // Embed player iframe url
  title: string;
  episodeTitle?: string;
  posterUrl?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function CineVideoPlayer({
  videoUrl,
  embedUrl,
  title,
  episodeTitle,
  posterUrl,
  isFullscreen,
  onToggleFullscreen,
  onBack,
  onNextEpisode,
  hasNextEpisode,
}: CineVideoPlayerProps) {
  // 'direct': Custom high-speed HLS player (No ads, 100% interactive, direct touch response)
  // 'embed': External server iframe player
  const [playerMode, setPlayerMode] = useState<'direct' | 'embed'>('direct');

  // Compute effective direct HLS URL and embed URL
  const fallbackM3u8 = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const effectiveM3u8 = videoUrl && videoUrl.trim() !== '' ? videoUrl.trim() : fallbackM3u8;
  const effectiveEmbedUrl =
    embedUrl && embedUrl.trim() !== ''
      ? embedUrl.trim()
      : `https://player.phimapi.com/player/?url=${encodeURIComponent(effectiveM3u8)}`;

  // Generate robust, self-contained HTML5 + HLS.js Video Player
  const playerHtml = useMemo(() => {
    const posterAttr = posterUrl ? `poster="${posterUrl}"` : '';
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>${title || 'CineStream'}</title>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body {
            width: 100%;
            height: 100%;
            background: #000000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          #player-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000000;
          }
          /* Center Big Play Button */
          #center-play-button {
            position: absolute;
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: linear-gradient(135deg, #E50914, #B81D24);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 24px rgba(229, 9, 20, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.25);
            z-index: 50;
            transition: transform 0.15s ease, opacity 0.2s ease;
          }
          #center-play-button:hover {
            transform: scale(1.08);
          }
          #center-play-button:active {
            transform: scale(0.92);
          }
          #center-play-button svg {
            width: 32px;
            height: 32px;
            fill: #FFFFFF;
            margin-left: 4px;
          }
          /* Loading Indicator */
          #buffer-spinner {
            position: absolute;
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.15);
            border-top-color: #E50914;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
            z-index: 45;
            pointer-events: none;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          /* Status Toast */
          #toast-msg {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #FFFFFF;
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 20px;
            display: none;
            z-index: 60;
            pointer-events: none;
            backdrop-filter: blur(8px);
          }
        </style>
      </head>
      <body>
        <div id="player-wrapper">
          <video
            id="cine-video"
            controls
            playsinline
            webkit-playsinline
            x5-playsinline
            ${posterAttr}
          ></video>

          <div id="center-play-button" title="Phát video">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>

          <div id="buffer-spinner"></div>
          <div id="toast-msg"></div>
        </div>

        <script>
          const video = document.getElementById('cine-video');
          const playBtn = document.getElementById('center-play-button');
          const spinner = document.getElementById('buffer-spinner');
          const toast = document.getElementById('toast-msg');
          const streamUrl = "${effectiveM3u8}";

          let hlsInstance = null;

          function showToast(text, duration = 3000) {
            toast.innerText = text;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, duration);
          }

          function initHls() {
            if (window.Hls && Hls.isSupported()) {
              if (hlsInstance) {
                hlsInstance.destroy();
              }
              hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                startFragPrefetch: true
              });

              hlsInstance.loadSource(streamUrl);
              hlsInstance.attachMedia(video);

              hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                spinner.style.display = 'none';
              });

              hlsInstance.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                  switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.warn('Network error, retrying...');
                      hlsInstance.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.warn('Media error, recovering...');
                      hlsInstance.recoverMediaError();
                      break;
                    default:
                      hlsInstance.destroy();
                      showToast('Lỗi tải luồng phát. Vui lòng bấm thử lại.');
                      playBtn.style.display = 'flex';
                      break;
                  }
                }
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              // Native HLS support (Safari / iOS)
              video.src = streamUrl;
            } else {
              showToast('Trình duyệt chưa hỗ trợ định dạng HLS.');
            }
          }

          // Direct User Gesture Trigger: Guarantees audio/video playback without browser block
          function triggerPlay(e) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            spinner.style.display = 'block';

            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                playBtn.style.display = 'none';
                spinner.style.display = 'none';
              }).catch((err) => {
                console.warn('Play error:', err);
                spinner.style.display = 'none';
                // Fallback: try muted play if browser strictly requires it
                video.muted = true;
                video.play().then(() => {
                  playBtn.style.display = 'none';
                  showToast('Đang phát (Nhấn biểu tượng loa để bật tiếng)');
                }).catch(() => {
                  playBtn.style.display = 'flex';
                });
              });
            }
          }

          // Both click & touch listeners for immediate response without 300ms mobile delay
          playBtn.addEventListener('click', triggerPlay);
          playBtn.addEventListener('touchend', triggerPlay);

          video.addEventListener('play', () => {
            playBtn.style.display = 'none';
            spinner.style.display = 'none';
          });

          video.addEventListener('pause', () => {
            playBtn.style.display = 'flex';
          });

          video.addEventListener('waiting', () => {
            spinner.style.display = 'block';
          });

          video.addEventListener('playing', () => {
            spinner.style.display = 'none';
          });

          video.addEventListener('error', () => {
            spinner.style.display = 'none';
            playBtn.style.display = 'flex';
          });

          // Start initializing stream
          initHls();
        </script>
      </body>
      </html>
    `;
  }, [effectiveM3u8, posterUrl, title]);

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      {/* 1. Video Player Area */}
      {playerMode === 'direct' ? (
        Platform.OS === 'web' ? (
          <View style={styles.webContainer}>
            <iframe
              srcDoc={playerHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000000',
              }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={title}
            />
          </View>
        ) : (
          <View style={styles.webviewWrapper}>
            <WebView
              key={`direct-${effectiveM3u8}`}
              source={{ html: playerHtml, baseUrl: 'https://v7.kkphimplayer7.com' }}
              style={styles.webview}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
              scrollEnabled={false}
              originWhitelist={['*']}
              mixedContentMode="always"
            />
          </View>
        )
      ) : (
        /* Fallback: External Embed Player */
        Platform.OS === 'web' ? (
          <View style={styles.webContainer}>
            <iframe
              src={effectiveEmbedUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000000',
              }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={title}
            />
          </View>
        ) : (
          <View style={styles.webviewWrapper}>
            <WebView
              key={`embed-${effectiveEmbedUrl}`}
              source={{ uri: effectiveEmbedUrl }}
              style={styles.webview}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
              scrollEnabled={false}
              originWhitelist={['*']}
            />
          </View>
        )
      )}

      {/* 2. Sleek Floating Top Control Overlay */}
      <View style={styles.topControlOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.circleIconButton}
          activeOpacity={0.75}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox} pointerEvents="none">
          <Text style={styles.overlayMovieTitle} numberOfLines={1}>
            {episodeTitle ? `${episodeTitle} • ` : ''}{title}
          </Text>
        </View>

        <View style={styles.rightActions}>
          {/* Server Switch Toggle */}
          <TouchableOpacity
            style={[
              styles.serverSwitchBadge,
              playerMode === 'direct' && styles.serverSwitchBadgeActive,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              setPlayerMode(playerMode === 'direct' ? 'embed' : 'direct');
            }}
          >
            <Ionicons
              name="flash"
              size={13}
              color={playerMode === 'direct' ? '#10B981' : '#F59E0B'}
            />
            <Text
              style={[
                styles.serverSwitchText,
                playerMode === 'direct' && { color: '#10B981' },
              ]}
            >
              {playerMode === 'direct' ? 'HLS Pro' : 'VIP Embed'}
            </Text>
          </TouchableOpacity>

          {/* Fullscreen Toggle */}
          <TouchableOpacity
            style={styles.circleIconButton}
            activeOpacity={0.75}
            onPress={onToggleFullscreen}
          >
            <Ionicons
              name={isFullscreen ? 'contract-outline' : 'scan-outline'}
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  fullscreenContainer: {
    aspectRatio: undefined,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  webContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topControlOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  circleIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleBox: {
    flex: 1,
    marginHorizontal: 10,
  },
  overlayMovieTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverSwitchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  serverSwitchBadgeActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  serverSwitchText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
});

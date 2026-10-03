import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { AuthAPI } from '@/services/API';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'expo-router';

// Hoàn tất phiên đăng nhập web browser nếu đang mở redirect
WebBrowser.maybeCompleteAuthSession();

// Google Client ID từ Google Cloud Console
export const GOOGLE_CLIENT_ID =
  '420488662006-09ha8j40agsbfi7lbmerquj7jq6uoi8b.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleAuth() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Web dùng localhost:8081, Native mobile dùng link proxy Expo chính thức của tài khoản kurumi1234
  const redirectUri = Platform.select({
    web: 'http://localhost:8081',
    default: 'https://auth.expo.io/@kurumi1234/FrontEnd',
  })!;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
      redirectUri,
      prompt: AuthSession.Prompt.SelectAccount,
    },
    discovery
  );

  useEffect(() => {
    async function handleResponse() {
      if (!response) return;

      if (response.type === 'success') {
        const accessToken = response.params?.access_token || response.authentication?.accessToken;
        const idToken = response.params?.id_token || response.authentication?.idToken;

        if (!accessToken && !idToken) {
          setError('Không nhận được token xác thực từ Google');
          return;
        }

        setIsLoading(true);
        setError(null);
        try {
          const res = await AuthAPI.googleLogin({
            accessToken,
            idToken,
          });

          if (res && res.success && res.data?.token) {
            contextLogin(res.data.user, res.data.token);
            router.replace('/(tabs)');
          } else {
            setError(res?.message || 'Đăng nhập Google thất bại');
          }
        } catch (err: any) {
          setError(err.message || 'Lỗi kết nối khi gửi dữ liệu xác thực Google');
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === 'error') {
        setError(response.error?.message || 'Đăng nhập Google gặp lỗi hoặc bị hủy');
      }
    }

    handleResponse();
  }, [response, contextLogin, router]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await promptAsync({ preferEphemeralSession: true });
    } catch (e: any) {
      setError(e.message || 'Không thể mở cửa sổ đăng nhập Google');
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    request,
    redirectUri,
  };
}

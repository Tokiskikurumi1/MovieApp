import React, { useState } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  ListOrdered,
  Star,
  CheckCircle,
  X,
  PlusCircle,
  Play,
} from 'lucide-react';
import { type Movie, type Episode, INITIAL_MOVIES } from '../../services/mockData';
import { ConfirmModal } from '../../components/UI/ConfirmModal';

export const MovieManagement: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedVipFilter, setSelectedVipFilter] = useState('ALL');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie> | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [activeMovieForEpisodes, setActiveMovieForEpisodes] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  // New Episode Input State
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('24 phút');
  const [newEpVideoUrl, setNewEpVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  // Available Genres
  const ALL_GENRES = [
    'Hành Động',
    'Anime',
    'Khoa Học Viễn Tưởng',
    'Hài Hước',
    'Tình Cảm',
    'Kinh Dị',
    'Phiêu Lưu',
    'Tâm Lý',
    'Lịch Sử',
    'Isekai',
  ];

  // Filtered list
  const filteredMovies = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.originalTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre =
      selectedGenre === 'ALL' || m.genres.includes(selectedGenre);
    const matchVip =
      selectedVipFilter === 'ALL' ||
      (selectedVipFilter === 'VIP' && m.isVip) ||
      (selectedVipFilter === 'FREE' && !m.isVip);

    return matchSearch && matchGenre && matchVip;
  });

  // Open Add Movie Modal
  const handleOpenAddMovie = () => {
    setEditingMovie({
      id: `movie-${Date.now()}`,
      title: '',
      originalTitle: '',
      synopsis: '',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop',
      banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: 5.0,
      voteCount: 1,
      year: 2024,
      quality: '4K HDR',
      ageLimit: '13+',
      isVip: false,
      status: 'active',
      genres: ['Hành Động'],
      totalEpisodes: 1,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      episodes: [
        {
          id: `ep-${Date.now()}-1`,
          episodeNumber: 1,
          title: 'Tập 1: Mở đầu siêu phẩm',
          duration: '45 phút',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop',
          views: 0,
        },
      ],
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Movie Modal
  const handleOpenEditMovie = (movie: Movie) => {
    setEditingMovie({ ...movie });
    setIsEditModalOpen(true);
  };

  // Save Movie (Add / Update)
  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie || !editingMovie.title) {
      alert('Vui lòng nhập tên phim!');
      return;
    }

    setMovies((prev) => {
      const exists = prev.some((m) => m.id === editingMovie.id);
      if (exists) {
        return prev.map((m) => (m.id === editingMovie.id ? (editingMovie as Movie) : m));
      } else {
        return [editingMovie as Movie, ...prev];
      }
    });

    setIsEditModalOpen(false);
    setEditingMovie(null);
  };

  // Delete Movie
  const handleConfirmDelete = () => {
    if (movieToDelete) {
      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setMovieToDelete(null);
    }
  };

  // Manage Episodes
  const handleOpenEpisodes = (movie: Movie) => {
    setActiveMovieForEpisodes(movie);
    setIsEpisodeModalOpen(true);
  };

  const handleAddEpisode = () => {
    if (!activeMovieForEpisodes || !newEpTitle) {
      alert('Vui lòng nhập tiêu đề tập phim!');
      return;
    }

    const nextEpNum = (activeMovieForEpisodes.episodes?.length || 0) + 1;
    const newEp: Episode = {
      id: `ep-${activeMovieForEpisodes.id}-${Date.now()}`,
      episodeNumber: nextEpNum,
      title: newEpTitle,
      duration: newEpDuration || '24 phút',
      videoUrl: newEpVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: activeMovieForEpisodes.poster,
      views: 0,
    };

    const updatedEpisodes = [...(activeMovieForEpisodes.episodes || []), newEp];
    const updatedMovie: Movie = {
      ...activeMovieForEpisodes,
      episodes: updatedEpisodes,
      totalEpisodes: updatedEpisodes.length,
    };

    setActiveMovieForEpisodes(updatedMovie);
    setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
    setNewEpTitle('');
  };

  const handleDeleteEpisode = (epId: string) => {
    if (!activeMovieForEpisodes) return;
    const updatedEpisodes = activeMovieForEpisodes.episodes.filter((ep) => ep.id !== epId);
    const updatedMovie: Movie = {
      ...activeMovieForEpisodes,
      episodes: updatedEpisodes,
      totalEpisodes: updatedEpisodes.length,
    };

    setActiveMovieForEpisodes(updatedMovie);
    setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
  };

  return (
    <div className="movie-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Film size={24} color="var(--primary)" />
            Quản Lý Phim & Danh Sách Tập
          </h2>
          <p className="page-subtitle">
            Cập nhật kho phim, video streaming URL, phân loại thể loại và đặc quyền gói VIP
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddMovie}>
          <Plus size={16} />
          <span>Thêm Phim Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên phim, tên gốc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          {/* Genre Filter */}
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="ALL">Tất cả thể loại</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* VIP Filter */}
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={selectedVipFilter}
            onChange={(e) => setSelectedVipFilter(e.target.value)}
          >
            <option value="ALL">Tất cả gói</option>
            <option value="VIP">Chỉ VIP 4K</option>
            <option value="FREE">Miễn phí (Free)</option>
          </select>
        </div>
      </div>

      {/* Movies Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Poster & Tên Phim</th>
              <th>Thể Loại</th>
              <th>Chất Lượng</th>
              <th>Gói Xem</th>
              <th>Số Tập</th>
              <th>Lượt Xem</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Không tìm thấy phim phù hợp với từ khóa tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: '44px',
                          height: '62px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>
                          {movie.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {movie.originalTitle} ({movie.year})
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            color: '#ffd700',
                            marginTop: '2px',
                          }}
                        >
                          <Star size={12} fill="#ffd700" />
                          <span>{movie.rating}</span>
                          <span style={{ color: 'var(--text-dim)' }}>({movie.voteCount} vote)</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                      {movie.genres.map((g) => (
                        <span key={g} className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-info">{movie.quality}</span>
                  </td>

                  <td>
                    {movie.isVip ? (
                      <span className="badge badge-vip">VIP 4K</span>
                    ) : (
                      <span className="badge badge-neutral">Miễn phí</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => handleOpenEpisodes(movie)}
                    >
                      <ListOrdered size={14} />
                      <span>{movie.episodes?.length || movie.totalEpisodes} tập</span>
                    </button>
                  </td>

                  <td style={{ fontWeight: 600 }}>
                    {movie.views.toLocaleString('vi-VN')}
                  </td>

                  <td>
                    {movie.status === 'active' ? (
                      <span className="badge badge-success">Đang chiếu</span>
                    ) : (
                      <span className="badge badge-warning">Bản nháp</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn-icon"
                        title="Quản lý tập phim"
                        onClick={() => handleOpenEpisodes(movie)}
                      >
                        <Play size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Chỉnh sửa thông tin phim"
                        onClick={() => handleOpenEditMovie(movie)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Xóa phim"
                        onClick={() => setMovieToDelete(movie)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Chỉnh Sửa Phim */}
      {isEditModalOpen && editingMovie && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMovie.title ? 'Chỉnh Sửa Thông Tin Phim' : 'Thêm Phim Mới Vào Hệ Thống'}
              </h3>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMovie}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tên Phim (Tiếng Việt)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Deadpool & Wolverine..."
                      value={editingMovie.title || ''}
                      onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên Gốc (Tiếng Anh/Gốc)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Deadpool & Wolverine"
                      value={editingMovie.originalTitle || ''}
                      onChange={(e) => setEditingMovie({ ...editingMovie, originalTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô Tả / Tóm Tắt Nội Dung Phim</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn cốt truyện phim..."
                    value={editingMovie.synopsis || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, synopsis: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">URL Ảnh Poster (Dọc)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMovie.poster || ''}
                      onChange={(e) => setEditingMovie({ ...editingMovie, poster: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">URL Ảnh Banner (Ngang)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMovie.banner || ''}
                      onChange={(e) => setEditingMovie({ ...editingMovie, banner: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Năm Phát Hành</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editingMovie.year || 2024}
                      onChange={(e) => setEditingMovie({ ...editingMovie, year: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chất Lượng</label>
                    <select
                      className="form-select"
                      value={editingMovie.quality || '4K HDR'}
                      onChange={(e) => setEditingMovie({ ...editingMovie, quality: e.target.value as any })}
                    >
                      <option value="4K HDR">4K HDR</option>
                      <option value="FHD 1080p">FHD 1080p</option>
                      <option value="HD">HD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Độ Tuổi</label>
                    <select
                      className="form-select"
                      value={editingMovie.ageLimit || '13+'}
                      onChange={(e) => setEditingMovie({ ...editingMovie, ageLimit: e.target.value })}
                    >
                      <option value="P">P (Mọi lứa tuổi)</option>
                      <option value="13+">13+</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gói Yêu Cầu</label>
                    <select
                      className="form-select"
                      value={editingMovie.isVip ? 'VIP' : 'FREE'}
                      onChange={(e) => setEditingMovie({ ...editingMovie, isVip: e.target.value === 'VIP' })}
                    >
                      <option value="FREE">Miễn phí</option>
                      <option value="VIP">VIP 4K</option>
                    </select>
                  </div>
                </div>

                {/* Genres Checkbox Tags */}
                <div className="form-group">
                  <label className="form-label">Thể Loại Phim</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ALL_GENRES.map((genre) => {
                      const isSelected = editingMovie.genres?.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          className={`badge ${isSelected ? 'badge-info' : 'badge-neutral'}`}
                          style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            const current = editingMovie.genres || [];
                            const updated = isSelected
                              ? current.filter((g) => g !== genre)
                              : [...current, genre];
                            setEditingMovie({ ...editingMovie, genres: updated });
                          }}
                        >
                          {isSelected && <CheckCircle size={12} />} {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Thông Tin Phim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản Lý Tập Phim */}
      {isEpisodeModalOpen && activeMovieForEpisodes && (
        <div className="modal-overlay" onClick={() => setIsEpisodeModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Danh Sách Tập: {activeMovieForEpisodes.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tổng số: {activeMovieForEpisodes.episodes?.length || 0} tập phim
                </p>
              </div>
              <button className="btn-icon" onClick={() => setIsEpisodeModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Form Thêm Tập Mới */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                  + Thêm Tập Mới Cho Phim
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tiêu đề tập (VD: Tập 4: Chiến Binh Rồng)"
                    value={newEpTitle}
                    onChange={(e) => setNewEpTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Thời lượng (VD: 24 phút)"
                    value={newEpDuration}
                    onChange={(e) => setNewEpDuration(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="URL Video Streaming (.mp4, .m3u8 HLS)"
                    value={newEpVideoUrl}
                    onChange={(e) => setNewEpVideoUrl(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleAddEpisode}>
                    <PlusCircle size={16} />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              {/* Episode List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {activeMovieForEpisodes.episodes?.map((ep) => (
                  <div
                    key={ep.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {ep.episodeNumber}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>
                          {ep.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {ep.duration} • {ep.views.toLocaleString('vi-VN')} lượt xem
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Xóa tập này"
                      onClick={() => handleDeleteEpisode(ep.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsEpisodeModalOpen(false)}>
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Delete */}
      <ConfirmModal
        isOpen={!!movieToDelete}
        title="Xác Nhận Xóa Phim"
        message={`Bạn có chắc chắn muốn xóa bộ phim "${movieToDelete?.title}" khỏi hệ thống không? Tất cả các tập phim liên quan sẽ bị gỡ bỏ.`}
        confirmText="Xóa Vĩnh Viễn"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMovieToDelete(null)}
      />
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Download,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { type Transaction } from '../../services/mockData';
import { AdminAPI } from '../../services/apiService';

export const BillingManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    bestSellingPackage: 'Gói VIP 1 Năm (4K HDR)',
    successRate: '100.0%',
    totalTransactions: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Transaction for Invoice Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadTransactions = useCallback(() => {
    AdminAPI.getTransactions({
      search: searchQuery,
      method: methodFilter,
      status: statusFilter,
    })
      .then((res) => {
        if (res.success && res.data) {
          setTransactions(res.data.transactions || []);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        }
      })
      .catch((err) => console.warn('Lỗi tải danh sách giao dịch:', err));
  }, [searchQuery, methodFilter, statusFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Không có dữ liệu giao dịch để xuất file.');
      return;
    }

    const headers = ['Mã Đơn', 'Khách Hàng', 'Email', 'Gói VIP', 'Số Tiền (VND)', 'Cổng Thanh Toán', 'Thời Gian', 'Trạng Thái'];
    const rows = transactions.map((t) => [
      t.orderCode,
      `"${t.user.name}"`,
      `"${t.user.email}"`,
      `"${t.packageName}"`,
      t.amount,
      t.paymentMethod,
      `"${t.createdAt}"`,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CINESTREAM_BaoCaoDoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="billing-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <CreditCard size={24} color="#ffd700" />
            Lịch Sử Giao Dịch & Gói Cước VIP
          </h2>
          <p className="page-subtitle">
            Theo dõi dòng tiền nạp VIP qua MoMo, VietQR, ZaloPay & Thẻ quốc tế thời gian thực từ Database
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <div className="badge badge-success" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Sparkles size={14} /> MySQL Live Data
          </div> */}
          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Xuất Báo Cáo CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI 3 Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            TỔNG TIỀN ĐÃ THU THÀNH CÔNG
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {summary.totalRevenue.toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            GÓI VIP BÁN CHẠY NHẤT
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffd700', marginTop: '8px' }}>
            {summary.bestSellingPackage}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            TỶ LỆ GIAO DỊCH THÀNH CÔNG
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {summary.successRate}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo mã đơn, khách hàng, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          {/* Method Filter */}
          <select
            className="form-select"
            style={{ width: '170px' }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="ALL">Tất cả phương thức</option>
            <option value="MoMo">Ví MoMo</option>
            <option value="VietQR">Chuyển khoản VietQR</option>
            <option value="ZaloPay">Ví ZaloPay</option>
            <option value="Visa/Mastercard">Thẻ Quốc Tế Visa</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="pending">Đang xử lý</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Giao Dịch</th>
              <th>Khách Hàng</th>
              <th>Gói Cước Đăng Ký</th>
              <th>Số Tiền</th>
              <th>Cổng Thanh Toán</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Không tìm thấy giao dịch phù hợp.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {tx.orderCode}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={tx.user.avatar}
                        alt={tx.user.name}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                          {tx.user.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {tx.user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#ffd700' }}>
                      {tx.packageName}
                    </span>
                  </td>

                  <td style={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                    {tx.amount.toLocaleString('vi-VN')} đ
                  </td>

                  <td>
                    <span className="badge badge-neutral">{tx.paymentMethod}</span>
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {tx.createdAt}
                  </td>

                  <td>
                    {tx.status === 'success' ? (
                      <span className="badge badge-success">Thành công</span>
                    ) : tx.status === 'pending' ? (
                      <span className="badge badge-warning">Đang xử lý</span>
                    ) : (
                      <span className="badge badge-danger">Hoàn tiền</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSelectedTx(tx)}
                    >
                      <FileText size={13} />
                      <span>Hóa Đơn</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chi Tiết Hóa Đơn */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Chi Tiết Hóa Đơn</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Mã giao dịch: <strong style={{ color: 'var(--primary)' }}>{selectedTx.orderCode}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedTx(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{selectedTx.user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email tài khoản:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedTx.user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gói dịch vụ:</span>
                <span style={{ fontWeight: 600, color: '#ffd700' }}>{selectedTx.packageName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '16px' }}>
                  {selectedTx.amount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{selectedTx.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Thời gian tạo đơn:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedTx.createdAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span>
                <span
                  className={`badge ${
                    selectedTx.status === 'success' ? 'badge-success' : selectedTx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  }`}
                >
                  {selectedTx.status === 'success' ? 'Thành công' : selectedTx.status === 'pending' ? 'Đang xử lý' : 'Hoàn tiền'}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => alert('Đã gửi lại biên lai điện tử tới email: ' + selectedTx.user.email)}
              >
                Gửi Lại Biên Lai Email
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedTx(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


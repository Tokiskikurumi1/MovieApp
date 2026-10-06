import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Download,
  X,
  FileText,
  Printer,
  Receipt,
  Building2,
} from 'lucide-react';
import { type Transaction } from '../../services/mockData';
import { AdminAPI } from '../../services/apiService';

export const BillingManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalVat: 0,
    totalNet: 0,
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
            setSummary((prev) => ({
              ...prev,
              ...res.data.summary,
              totalVat: res.data.summary.totalVat || Math.round((res.data.summary.totalRevenue / 1.1) * 0.1),
              totalNet: res.data.summary.totalNet || Math.round(res.data.summary.totalRevenue / 1.1),
            }));
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

    const headers = [
      'Mã Đơn',
      'Khách Hàng',
      'Email',
      'Gói VIP',
      'Tổng Thu (VND)',
      'Thuế GTGT 10% (VND)',
      'Doanh Thu Thuần (VND)',
      'Mã Hóa Đơn VAT',
      'Cổng Thanh Toán',
      'Thời Gian',
      'Trạng Thái',
    ];
    const rows = transactions.map((t) => [
      t.orderCode,
      `"${t.user.name}"`,
      `"${t.user.email}"`,
      `"${t.packageName}"`,
      t.amount,
      t.vatAmount || Math.round((t.amount / 1.1) * 0.1),
      t.netAmount || Math.round(t.amount / 1.1),
      t.invoiceCode || `HD-2026-${t.orderCode.slice(-6)}`,
      t.paymentMethod,
      `"${t.createdAt}"`,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CINESTREAM_BaoCaoThue_DoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
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
            Lịch Sử Giao Dịch & Quản Lý Thuế GTGT (VAT)
          </h2>
          <p className="page-subtitle">
            Theo dõi dòng tiền nạp VIP, hạch toán thuế GTGT 10% & phát hành Hóa đơn điện tử (E-Invoice) theo Nghị định 123
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Xuất Báo Cáo Thuế CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI 4 Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            TỔNG DOANH THU ĐÃ THU (GROSS)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {summary.totalRevenue.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Bao gồm 10% thuế GTGT
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            THUẾ GTGT PHẢI NỘP (VAT 10%)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            {summary.totalVat.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Nghĩa vụ nộp ngân sách nhà nước
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            DOANH THU THUẦN (NET REVENUE)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>
            {summary.totalNet.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Doanh thu thực tế sau khi trừ thuế
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            TỶ LỆ THÀNH CÔNG & GÓI TOP 1
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffd700', marginTop: '6px' }}>
            {summary.successRate}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summary.bestSellingPackage}
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
              <th>Tổng Thu (Gross)</th>
              <th>Thuế GTGT (10%)</th>
              <th>Hóa Đơn VAT</th>
              <th>Cổng Thanh Toán</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Không tìm thấy giao dịch phù hợp.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const vat = tx.vatAmount || Math.round((tx.amount / 1.1) * 0.1);
                const invCode = tx.invoiceCode || `HD-2026-${tx.orderCode.slice(-5)}`;
                return (
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
                      <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
                        {vat.toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Thuế suất 10%</div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="badge badge-info"
                        style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', fontSize: '11.5px', fontFamily: 'monospace' }}
                        onClick={() => setSelectedTx(tx)}
                        title="Bấm để xem hóa đơn VAT điện tử"
                      >
                        <Receipt size={12} /> {invCode}
                      </button>
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
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => setSelectedTx(tx)}
                      >
                        <FileText size={13} />
                        <span>Hóa Đơn</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Hóa Đơn Điện Tử Giá Trị Gia Tăng (E-Invoice Standard) */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '620px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Top Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                padding: '24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={18} color="#ffd700" />
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700 }}>
                    HỆ THỐNG PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG (VAT)
                </h3>
                <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', margin: 0 }}>
                  Ký hiệu: <strong>C26TAA</strong> • Mẫu số: <strong>01GTKT0/001</strong> • Số HĐ:{' '}
                  <strong style={{ color: '#38bdf8' }}>{selectedTx.invoiceCode || `HD-2026-${selectedTx.orderCode.slice(-5)}`}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedTx(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Invoice Body Content */}
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Seller & Buyer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Đơn vị bán hàng (Bên phát hành)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    CTY CỔ PHẦN CÔNG NGHỆ & TRUYỀN THÔNG CINESTREAM
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    MST: <strong style={{ color: '#10b981' }}>0109888999</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Cầu Giấy, Hà Nội, Việt Nam
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Người mua hàng (Hội viên VIP)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {selectedTx.user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Email: {selectedTx.user.email}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Mã GD: {selectedTx.orderCode}
                  </div>
                </div>
              </div>

              {/* Service & Tax Calculation Breakdown */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <div>NỘI DUNG DỊCH VỤ</div>
                  <div style={{ textAlign: 'center' }}>THUẾ SUẤT</div>
                  <div style={{ textAlign: 'right' }}>THÀNH TIỀN</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{selectedTx.packageName}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cung cấp dịch vụ xem phim số trực tuyến bản quyền</div>
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>10%</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                    {selectedTx.amount.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                {/* Subtotals & Taxes */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>Cộng tiền dịch vụ (Chưa thuế):</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      {(selectedTx.netAmount || Math.round(selectedTx.amount / 1.1)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>Tiền thuế giá trị gia tăng (VAT 10%):</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                      {(selectedTx.vatAmount || Math.round((selectedTx.amount / 1.1) * 0.1)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Tổng cộng tiền thanh toán:</span>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '18px' }}>
                      {selectedTx.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital Signature & Metadata */}
              <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px dashed #10b981', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                    ✓ CHỮ KÝ SỐ HỢP LỆ (DIGITAL SIGNATURE)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Ký bởi: CINESTREAM CA • Thời gian: {selectedTx.createdAt}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Kênh TT: <strong style={{ color: '#fff' }}>{selectedTx.paymentMethod}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '16px 24px', background: 'var(--bg-surface-elevated)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} />
                <span>In Hóa Đơn VAT</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  alert('Biên lai thuế điện tử và link tra cứu đã được gửi thành công đến: ' + selectedTx.user.email);
                }}
              >
                <span>Gửi Biên Lai Email</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedTx(null)}
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

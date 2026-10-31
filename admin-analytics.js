const RoyAdminAnalytics = (() => {
  const get = id => document.getElementById(id);
  let version = 0, report;
  const names = { pageview: 'Page views', booking_open: 'Booking link clicks', whatsapp: 'WhatsApp link clicks', email: 'Email link clicks', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' };
  function breakdown(id, rows, key) {
    const list = get(id); list.replaceChildren();
    if (!rows.length) { const item = document.createElement('li'); item.textContent = 'No activity recorded in this period.'; list.appendChild(item); }
    rows.forEach(row => { const item = document.createElement('li'), label = document.createElement('span'), count = document.createElement('strong'); label.textContent = names[row[key]] || row[key]; count.textContent = row.count.toLocaleString(); item.append(label,count); list.appendChild(item); });
  }
  async function refresh() {
    const current = ++version; get('analyticsExport').disabled = true; get('analyticsNotice').textContent = 'Loading audience records…';
    try {
      const data = await RoyAPI.request('/api/admin/analytics?days=' + get('analyticsDays').value);
      if (version !== current) return;
      report = data;
      get('analyticsLifetime').textContent = `All recorded time: ${data.lifetimeVisits.toLocaleString()} visits · ${data.lifetimeViews.toLocaleString()} page views. Records are saved in your database across server restarts.`;
      for (const [id,value] of Object.entries({ analyticsVisits:data.visits, analyticsViews:data.views, analyticsAccounts:data.business.newAccounts, analyticsEnquiries:data.business.enquiries })) get(id).textContent = value.toLocaleString();
      breakdown('analyticsPages',data.pages,'page'); breakdown('analyticsActions',data.actions,'kind'); breakdown('analyticsDevices',data.devices,'device'); breakdown('analyticsSources',data.sources,'source');
      get('analyticsDaily').replaceChildren();
      data.daily.forEach(row => { const tr = document.createElement('tr'); for (const key of ['day','visits','views','accounts','enquiries']) { const td = document.createElement('td'); td.textContent = row[key]; tr.appendChild(td); } get('analyticsDaily').appendChild(tr); });
      get('analyticsNotice').textContent = data.startedAt ? `Last ${data.days} days · browsing records began ${data.startedAt.slice(0,10)} · updated ${new Date().toLocaleTimeString()}` : 'Tracking is ready. The first recorded visit will appear here; past traffic cannot be reconstructed.';
      const b = data.business;
      get('analyticsBusiness').textContent = `${b.registered} registered client accounts in total (owner excluded) · ${b.bookingClients} distinct clients submitted enquiries in this period · ${b.completed} completed sessions and ${b.cancelled} cancelled enquiries across all time. Confirmed appointments are shown below. Daily visits can repeat across dates and should not be added to estimate people.`;
      get('analyticsExport').disabled = false;
    } catch (error) { if (version === current) get('analyticsNotice').textContent = 'Audience records could not load. Use Refresh to retry. Booking records remain separate.'; }
  }
  document.addEventListener('DOMContentLoaded', () => {
    get('analyticsDays').addEventListener('change',refresh);
    get('analyticsRefresh').addEventListener('click',refresh);
    get('analyticsExport').addEventListener('click', () => {
      if (!report) return;
      const csv = ['date_utc,visits,page_views,new_client_accounts,booking_enquiries', ...report.daily.map(row => [row.day,row.visits,row.views,row.accounts,row.enquiries].join(','))].join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'roy-daily-activity-' + report.days + '-days.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
    });
  });
  return { refresh };
})();


    // Global variables
    let map;
    let messages = [
      {
        id: 1,
        name: 'Aliyev Botir Karimovich',
        region: 'Olmazor tumani, Toshkent',
        issue: 'Chiqindilar ko\'payib ketgan, tezda tozalash kerak',
        date: '2025-01-28',
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300',
        coords: [41.3305, 69.2415],
        brigade: null,
        executor: null,
        response: null
      },
      {
        id: 2,
        name: 'Karimova Dildora Shavkatovna',
        region: 'Chilonzor tumani, Toshkent',
        issue: 'Daraxt kesilgan joyni obodonlashtirish',
        date: '2025-01-27',
        status: 'progress',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
        coords: [41.2995, 69.2700],
        brigade: 'landscaping',
        executor: 'Yusupov Aziz',
        response: null
      },
      {
        id: 3,
        name: 'Toshmatov Javlon Utkurovich',
        region: 'Yunusobod tumani, Toshkent',
        issue: 'Yo\'l chetida moy to\'kilgan, tozalash zarur',
        date: '2025-01-26',
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
        coords: [41.3667, 69.2892],
        brigade: 'cleaning',
        executor: 'Rahmonov Islom',
        response: 'Muammo hal qilindi. Rahmat!'
      }
    ];

    // Initialize application
    document.addEventListener('DOMContentLoaded', function() {
      renderMessages();
      updateSelectOptions();
      updateStatistics();
      initializeMap();
    });

    // Show section function
    function showSection(sectionId) {
      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Remove active class from all nav links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      // Show selected section
      document.getElementById(sectionId).classList.add('active');
      
      // Add active class to clicked nav link
      event.target.closest('.nav-link').classList.add('active');
      
      // Initialize map if map section is shown
      if (sectionId === 'map' && !map) {
        setTimeout(initializeMap, 100);
      }
    }

    // Render messages table
    function renderMessages() {
      const messageList = document.getElementById('messageList');
      messageList.innerHTML = '';
      
      messages.forEach(msg => {
        const statusClass = `status-${msg.status}`;
        const statusText = getStatusText(msg.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>#${msg.id}</strong></td>
          <td>
            <div>
              <strong>${msg.name}</strong>
            </div>
          </td>
          <td>
            <i class="bi bi-geo-alt-fill text-primary"></i> ${msg.region}
          </td>
          <td>${msg.issue}</td>
          <td>
            <i class="bi bi-calendar-fill text-muted"></i> ${formatDate(msg.date)}
          </td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
          <td>
            <img src="${msg.image}" class="message-image" onclick="showImageModal('${msg.image}')" alt="Muammo rasmi">
          </td>
          <td>
            <div class="btn-group" role="group">
              <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${msg.id})" title="Batafsil">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button class="btn btn-sm btn-outline-success" onclick="quickAssign(${msg.id})" title="Tez tayinlash">
                <i class="bi bi-person-plus-fill"></i>
              </button>
            </div>
          </td>
        `;
        messageList.appendChild(row);
      });
    }

    // Update select options
    function updateSelectOptions() {
      const selects = ['messageSelect', 'responseMessageSelect', 'assignMessageSelect'];
      
      selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Xabar tanlang...</option>';
        
        messages.forEach(msg => {
          const option = document.createElement('option');
          option.value = msg.id;
          option.textContent = `#${msg.id} - ${msg.name} (${msg.issue.substring(0, 30)}...)`;
          select.appendChild(option);
        });
      });
    }

    // Initialize map
    function initializeMap() {
      if (map) {
        map.remove();
      }
      
      map = L.map('mapContainer').setView([41.3111, 69.2797], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Add markers for each message
      messages.forEach(msg => {
        const color = msg.status === 'completed' ? 'green' : 
                     msg.status === 'progress' ? 'orange' : 'red';
        
        const marker = L.marker(msg.coords).addTo(map);
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h6>${msg.name}</h6>
            <p><strong>Muammo:</strong> ${msg.issue}</p>
            <p><strong>Hudud:</strong> ${msg.region}</p>
            <p><strong>Holat:</strong> <span class="status-badge status-${msg.status}">${getStatusText(msg.status)}</span></p>
            <img src="${msg.image}" style="width: 100%; max-width: 150px; border-radius: 5px;">
          </div>
        `);
      });
    }

    // Update status function
    function updateStatus() {
      const messageId = parseInt(document.getElementById('messageSelect').value);
      const newStatus = document.getElementById('statusSelect').value;
      
      if (!messageId || !newStatus) {
        showNotification('warning', 'Iltimos, xabar va holatni tanlang!');
        return;
      }
      
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.status = newStatus;
        renderMessages();
        updateStatistics();
        if (map) {
          initializeMap(); // Update map markers
        }
        showNotification('success', `Xabar #${messageId} holati yangilandi!`);
        
        // Clear form
        document.getElementById('messageSelect').value = '';
        document.getElementById('statusSelect').value = '';
      }
    }

    // Send response function
    function sendResponse() {
      const messageId = parseInt(document.getElementById('responseMessageSelect').value);
      const responseText = document.getElementById('responseText').value.trim();
      
      if (!messageId || !responseText) {
        showNotification('warning', 'Iltimos, xabar va javob matnini kiriting!');
        return;
      }
      
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.response = responseText;
        showNotification('success', `Fuqaroga javob yuborildi!`);
        
        // Clear form
        document.getElementById('responseMessageSelect').value = '';
        document.getElementById('responseText').value = '';
      }
    }

    // Assign brigade function
    function assignBrigade() {
      const messageId = parseInt(document.getElementById('assignMessageSelect').value);
      const brigade = document.getElementById('brigadeSelect').value;
      const executor = document.getElementById('executorName').value.trim();
      const note = document.getElementById('assignmentNote').value.trim();
      
      if (!messageId || !brigade || !executor) {
        showNotification('warning', 'Iltimos, barcha majburiy maydonlarni to\'ldiring!');
        return;
      }
      
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.brigade = brigade;
        message.executor = executor;
        message.status = 'progress';
        message.assignmentNote = note;
        
        renderMessages();
        updateStatistics();
        if (map) {
          initializeMap(); // Update map markers
        }
        showNotification('success', `Brigada tayinlandi va vazifa berildi!`);
        
        // Clear form
        document.getElementById('assignMessageSelect').value = '';
        document.getElementById('brigadeSelect').value = '';
        document.getElementById('executorName').value = '';
        document.getElementById('assignmentNote').value = '';
      }
    }

    // Download report function
    function downloadReport(type) {
      const reportData = generateReportData(type);
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-hisobot-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', `${type === 'daily' ? 'Kunlik' : 'Haftalik'} hisobot yuklab olindi!`);
    }

    // Generate report data
    function generateReportData(type) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('uz-UZ');
      
      let report = `ECOHELPER - ${type === 'daily' ? 'KUNLIK' : 'HAFTALIK'} HISOBOT\n`;
      report += `Sana: ${dateStr}\n`;
      report += `=====================================\n\n`;
      
      report += `UMUMIY STATISTIKA:\n`;
      report += `- Jami xabarlar: ${messages.length}\n`;
      report += `- Bajarilgan: ${messages.filter(m => m.status === 'completed').length}\n`;
      report += `- Jarayonda: ${messages.filter(m => m.status === 'progress').length}\n`;
      report += `- Kutilayotgan: ${messages.filter(m => m.status === 'pending').length}\n\n`;
      
      report += `BATAFSIL MA'LUMOT:\n`;
      messages.forEach(msg => {
        report += `\n#${msg.id} - ${msg.name}\n`;
        report += `Hudud: ${msg.region}\n`;
        report += `Muammo: ${msg.issue}\n`;
        report += `Holat: ${getStatusText(msg.status)}\n`;
        if (msg.executor) {
          report += `Mas'ul: ${msg.executor}\n`;
        }
        if (msg.response) {
          report += `Javob: ${msg.response}\n`;
        }
        report += `---\n`;
      });
      
      return report;
    }

    // View details function
    function viewDetails(messageId) {
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        let details = `XABAR TAFSILOTLARI\n\n`;
        details += `ID: #${message.id}\n`;
        details += `Ismi: ${message.name}\n`;
        details += `Hudud: ${message.region}\n`;
        details += `Muammo: ${message.issue}\n`;
        details += `Sana: ${formatDate(message.date)}\n`;
        details += `Holat: ${getStatusText(message.status)}\n`;
        
        if (message.executor) {
          details += `Mas'ul xodim: ${message.executor}\n`;
        }
        if (message.brigade) {
          details += `Brigada: ${getBrigadeText(message.brigade)}\n`;
        }
        if (message.response) {
          details += `Javob: ${message.response}\n`;
        }
        if (message.assignmentNote) {
          details += `Qo'shimcha izoh: ${message.assignmentNote}\n`;
        }
        
        alert(details);
      }
    }

    // Quick assign function
    function quickAssign(messageId) {
      const message = messages.find(msg => msg.id === messageId);
      if (message && message.status === 'pending') {
        // Auto assign to cleaning brigade
        message.brigade = 'cleaning';
        message.executor = 'Tez tayinlangan xodim';
        message.status = 'progress';
        
        renderMessages();
        updateStatistics();
        if (map) {
          initializeMap();
        }
        showNotification('success', `Xabar #${messageId} tezda tayinlandi!`);
      } else {
        showNotification('warning', 'Bu xabar allaqachon tayinlangan!');
      }
    }

    // Show image modal
    function showImageModal(imageSrc) {
      document.getElementById('modalImage').src = imageSrc;
      const modal = new bootstrap.Modal(document.getElementById('imageModal'));
      modal.show();
    }

    // Helper functions
    function getStatusText(status) {
      switch(status) {
        case 'pending': return 'Kutilmoqda';
        case 'progress': return 'Bajarilmoqda';
        case 'completed': return 'Yakunlandi';
        default: return 'Noma\'lum';
      }
    }

    function getBrigadeText(brigade) {
      switch(brigade) {
        case 'cleaning': return '1-Brigada (Tozalash)';
        case 'landscaping': return '2-Brigada (Obodonlashtirish)';
        case 'maintenance': return '3-Brigada (Texnik xizmat)';
        case 'emergency': return '4-Brigada (Shoshilinch)';
        default: return 'Tayinlanmagan';
      }
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ');
    }

    // Update statistics
    function updateStatistics() {
      document.getElementById('totalMessages').textContent = messages.length;
      document.getElementById('completedTasks').textContent = messages.filter(m => m.status === 'completed').length;
      document.getElementById('pendingTasks').textContent = messages.filter(m => m.status === 'pending').length;
      document.getElementById('progressTasks').textContent = messages.filter(m => m.status === 'progress').length;
    }

    // Show notification
    function showNotification(type, message) {
      const notification = document.createElement('div');
      notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show notification`;
      notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'x-circle'}-fill me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      
      document.getElementById('notificationContainer').appendChild(notification);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }

    // Add some sample data periodically (simulation)
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        const sampleMessages = [
          {
            name: 'Abdullayev Karim',
            region: 'Mirzo Ulugbek tumani',
            issue: 'Hovli oldida chiqindi to\'plangan',
            coords: [41.3500, 69.3200]
          },
          {
            name: 'Rahimova Gulnora',
            region: 'Sergeli tumani',
            issue: 'Yo\'l chetidagi o\'tlar o\'sib ketgan',
            coords: [41.2200, 69.2200]
          }
        ];
        
        const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        const newMessage = {
          id: messages.length + 1,
          name: sample.name,
          region: sample.region,
          issue: sample.issue,
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
          coords: sample.coords,
          brigade: null,
          executor: null,
          response: null
        };
        
        messages.push(newMessage);
        renderMessages();
        updateSelectOptions();
        updateStatistics();
        if (map) {
          initializeMap();
        }
        showNotification('info', 'Yangi xabar qabul qilindi!');
      }
    }, 30000); // Check every 30 seconds
// CyberThreat LiveMap - JavaScript

class CyberThreatMap {
    constructor() {
        this.isLive = true;
        this.feedPaused = false;
        this.threatTypes = ['malware', 'ddos', 'phishing', 'scanning', 'botnet', 'ransomware'];
        this.countries = [
            { name: 'United States', code: 'US', flag: '🇺🇸' },
            { name: 'China', code: 'CN', flag: '🇨🇳' },
            { name: 'Russia', code: 'RU', flag: '🇷🇺' },
            { name: 'Germany', code: 'DE', flag: '🇩🇪' },
            { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
            { name: 'Japan', code: 'JP', flag: '🇯🇵' },
            { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
            { name: 'India', code: 'IN', flag: '🇮🇳' },
            { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
            { name: 'France', code: 'FR', flag: '🇫🇷' },
            { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
            { name: 'Canada', code: 'CA', flag: '🇨🇦' }
        ];
        
        this.threatSources = [
            'Honeypot Network', 'Security Researchers', 'ISP Reports', 'Threat Intelligence',
            'Government Agencies', 'Cybersecurity Firms', 'Academic Institutions', 'Private Sector'
        ];

        this.init();
    }

    init() {
        this.updateStats();
        this.startLiveFeed();
        this.updateTopTargets();
        this.setupEventListeners();
        this.createAttackChart();
        this.addRandomAttackPulses();
        
        // Update intervals
        setInterval(() => this.updateStats(), 5000);
        setInterval(() => this.updateTopTargets(), 15000);
        setInterval(() => this.addRandomAttackPulses(), 3000);
    }

    setupEventListeners() {
        // Feed controls
        document.getElementById('pauseFeed')?.addEventListener('click', () => {
            this.feedPaused = !this.feedPaused;
            const btn = document.getElementById('pauseFeed');
            btn.textContent = this.feedPaused ? '▶️ Resume' : '⏸️ Pause';
        });

        document.getElementById('clearFeed')?.addEventListener('click', () => {
            document.getElementById('threatFeed').innerHTML = '';
        });

        // Map filters
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterAttacks(e.target.dataset.filter);
            });
        });
    }

    updateStats() {
        const stats = {
            criticalThreats: Math.floor(Math.random() * 500) + 1200,
            activeScans: Math.floor(Math.random() * 2000) + 8500,
            totalAttacks: Math.floor(Math.random() * 10000) + 45000,
            blockedAttacks: Math.floor(Math.random() * 5000) + 12000
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.animateNumber(element, parseInt(element.textContent) || 0, stats[key]);
            }
        });
    }

    animateNumber(element, start, end) {
        const duration = 1000;
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    startLiveFeed() {
        setInterval(() => {
            if (!this.feedPaused) {
                this.addThreatToFeed();
            }
        }, 2000 + Math.random() * 3000);
    }

    addThreatToFeed() {
        const feed = document.getElementById('threatFeed');
        if (!feed) return;

        const threat = this.generateRandomThreat();
        const threatElement = this.createThreatElement(threat);
        
        feed.insertBefore(threatElement, feed.firstChild);

        // Remove old threats (keep max 20)
        while (feed.children.length > 20) {
            feed.removeChild(feed.lastChild);
        }
    }

    generateRandomThreat() {
        const types = this.threatTypes;
        const severities = [
            { level: 'high', weight: 2 },
            { level: 'medium', weight: 5 },
            { level: 'low', weight: 3 }
        ];
        
        const weightedSeverities = [];
        severities.forEach(s => {
            for (let i = 0; i < s.weight; i++) {
                weightedSeverities.push(s.level);
            }
        });

        const sourceCountry = this.countries[Math.floor(Math.random() * this.countries.length)];
        const targetCountry = this.countries[Math.floor(Math.random() * this.countries.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const severity = weightedSeverities[Math.floor(Math.random() * weightedSeverities.length)];
        const source = this.threatSources[Math.floor(Math.random() * this.threatSources.length)];

        return {
            type,
            severity,
            source: sourceCountry,
            target: targetCountry,
            detectedBy: source,
            timestamp: new Date(),
            ip: this.generateRandomIP(),
            description: this.getThreatDescription(type, severity)
        };
    }

    generateRandomIP() {
        return `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    getThreatDescription(type, severity) {
        const descriptions = {
            malware: {
                high: 'Advanced persistent threat detected',
                medium: 'Suspicious executable identified',
                low: 'Potential malware signature found'
            },
            ddos: {
                high: 'Large-scale DDoS attack in progress',
                medium: 'Coordinated attack attempt detected',
                low: 'Unusual traffic pattern observed'
            },
            phishing: {
                high: 'Targeted spear-phishing campaign',
                medium: 'Suspicious email campaign detected',
                low: 'Potential phishing attempt identified'
            },
            scanning: {
                high: 'Aggressive port scanning detected',
                medium: 'Systematic network reconnaissance',
                low: 'Automated scanning activity'
            },
            botnet: {
                high: 'Botnet command & control activity',
                medium: 'Botnet communication detected',
                low: 'Suspected bot behavior'
            },
            ransomware: {
                high: 'Active ransomware deployment',
                medium: 'Ransomware-related activity',
                low: 'Potential ransomware indicators'
            }
        };

        return descriptions[type]?.[severity] || 'Suspicious activity detected';
    }

    createThreatElement(threat) {
        const div = document.createElement('div');
        div.className = 'threat-item';
        
        const timeStr = threat.timestamp.toLocaleTimeString();
        
        div.innerHTML = `
            <div class="threat-severity ${threat.severity}">${threat.severity.toUpperCase()}</div>
            <div class="threat-details">
                <div class="threat-source">${threat.source.flag} ${threat.source.name} → ${threat.target.flag} ${threat.target.name}</div>
                <div class="threat-target">${threat.description} (${threat.ip})</div>
                <div class="threat-time">Detected by ${threat.detectedBy}</div>
            </div>
            <div class="threat-time">${timeStr}</div>
        `;
        
        return div;
    }

    updateTopTargets() {
        const targetsList = document.getElementById('targetsList');
        if (!targetsList) return;

        const targets = this.countries
            .map(country => ({
                ...country,
                attacks: Math.floor(Math.random() * 1000) + 100
            }))
            .sort((a, b) => b.attacks - a.attacks)
            .slice(0, 8);

        targetsList.innerHTML = targets.map(target => `
            <div class="target-item">
                <div class="target-info">
                    <div class="target-flag">${target.flag}</div>
                    <div class="target-details">
                        <h4>${target.name}</h4>
                        <p>${target.code} • ${Math.floor(Math.random() * 50) + 10} ISPs affected</p>
                    </div>
                </div>
                <div class="target-count">${target.attacks.toLocaleString()}</div>
            </div>
        `).join('');

        // Update timestamp
        const updateElement = document.getElementById('targetsUpdate');
        if (updateElement) {
            updateElement.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        }
    }

    addRandomAttackPulses() {
        const map = document.querySelector('.world-map');
        if (!map) return;

        // Remove old pulses
        const existingPulses = map.querySelectorAll('.attack-pulse');
        if (existingPulses.length > 15) {
            existingPulses[0].remove();
        }

        // Add new pulse
        const pulse = document.createElement('div');
        pulse.className = 'attack-pulse';
        
        const type = this.threatTypes[Math.floor(Math.random() * this.threatTypes.length)];
        pulse.setAttribute('data-type', type);
        
        // Random position
        pulse.style.top = `${Math.random() * 80 + 10}%`;
        pulse.style.left = `${Math.random() * 80 + 10}%`;
        
        map.appendChild(pulse);
        
        // Remove after animation
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.remove();
            }
        }, 8000);
    }

    filterAttacks(filter) {
        const pulses = document.querySelectorAll('.attack-pulse');
        
        pulses.forEach(pulse => {
            if (filter === 'all' || pulse.getAttribute('data-type') === filter) {
                pulse.style.display = 'block';
            } else {
                pulse.style.display = 'none';
            }
        });
    }

    createAttackChart() {
        const canvas = document.getElementById('attackChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Chart data
        const data = [
            { label: 'Malware', value: 35, color: '#ff1744' },
            { label: 'DDoS', value: 25, color: '#ff9800' },
            { label: 'Phishing', value: 20, color: '#2196f3' },
            { label: 'Scanning', value: 15, color: '#4caf50' },
            { label: 'Other', value: 5, color: '#9c27b0' }
        ];

        // Draw pie chart
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        let currentAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.value / 100) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.label} (${item.value}%)`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius / 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#222222';
        ctx.fill();

        // Update chart periodically
        setTimeout(() => this.createAttackChart(), 30000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CyberThreatMap();
    
    // Add loading effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Add some interactive effects
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.stat-card, .card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            card.style.transform = `perspective(1000px) rotateY(${deltaX * 5}deg) rotateX(${-deltaY * 5}deg)`;
        } else {
            card.style.transform = '';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'p':
                e.preventDefault();
                document.getElementById('pauseFeed')?.click();
                break;
            case 'k':
                e.preventDefault();
                document.getElementById('clearFeed')?.click();
                break;
        }
    }
});
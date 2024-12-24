async function detectHardwareAndEnvironment() {
    const infoDiv = document.getElementById("ip-hardware-info");

    try {
        // Fetching IP-related information
        const ipData = await fetch('https://ipapi.co/json/').then(response => response.json()).catch(error => {
            console.error('Error fetching IP information:', error);
            return null;
        });

        // Rendering IP-related information
        if (ipData) {
            document.querySelector('.ip').innerHTML = `
                <h2>IP Information</h2>
                ${Object.entries({
                    'IP Address': ipData.ip,
                    'Network': ipData.network,
                    'Version': ipData.version,
                    'ASN': ipData.asn,
                    'Organization': ipData.org,
                    'Country': ipData.country_name,
                    'Country Capital': ipData.country_capital,
                    'Region': ipData.region,
                    'City': ipData.city,
                    'Postal': ipData.postal,
                    'Timezone': ipData.timezone,
                    'UTC Offset': ipData.utc_offset,
                    'Country Calling Code': ipData.country_calling_code,
                    'Currency': ipData.currency,
                })
                .map(([key, value]) => `
                    <div class="box-nav">
                        <div><strong>${key}:</strong></div> <div>${value || 'Unknown'}</div>
                    </div>
                `)
                .join('')}
            `;
        }

        // Gathering hardware and environment data
        const hardwareData = {
            LogicalProcessors: navigator.hardwareConcurrency || 'Unknown',
            Memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
            Platform: navigator.platform || 'Unknown',
            UserAgent: navigator.userAgent || 'Unknown',
            ScreenResolution: `${window.screen.width || 'Unknown'} x ${window.screen.height || 'Unknown'}`,
            ColorDepth: window.screen.colorDepth || 'Unknown',
            PixelRatio: window.devicePixelRatio || 'Unknown',
            Orientation: screen.orientation?.type || 'Unknown',
            TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            TimeOffset: new Date().getTimezoneOffset(),
        };

        // GPU Info
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            hardwareData.GPUVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unavailable';
            hardwareData.GPURenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
        } else {
            hardwareData.GPUVendor = hardwareData.GPURenderer = 'Unknown';
        }

        // Performance Test
        hardwareData.PerformanceTest = (() => {
            const start = performance.now();
            for (let i = 0; i < 1e7; i++) {}
            return `${(performance.now() - start).toFixed(2)} ms`;
        })();

        // Battery Info
        const batteryData = await navigator.getBattery?.();
        hardwareData.BatteryLevel = batteryData ? `${(batteryData.level * 100).toFixed(0)}%` : 'Unknown';
        hardwareData.IsCharging = batteryData ? (batteryData.charging ? 'Yes' : 'No') : 'Unknown';

        // Network Info
        const connection = navigator.connection || {};
        hardwareData.NetworkType = connection.effectiveType || 'Unknown';
        hardwareData.NetworkSpeed = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';

        // Features
        hardwareData.Features = {
            WebRTC: !!navigator.mediaDevices,
            WebGL: !!gl,
            ServiceWorker: !!navigator.serviceWorker,
            PushNotifications: !!window.Notification,
            LocalStorage: !!window.localStorage,
            SessionStorage: !!window.sessionStorage,
        };

        // Rendering dynamic hardware and environment information
        infoDiv.innerHTML = `
            <div class="box">
                <h1>My IP Address</h1>
                <p class="ip"></p>

                <h2>Time Information</h2>
                <div class="box-nav">
                    <div><strong>Dynamic Local Time:</strong></div> <div id="dynamic-time"></div>
                </div>
                <div class="box-nav">
                    <div><strong>Time Zone:</strong></div> <div>${hardwareData.TimeZone}</div>
                </div>
                <div class="box-nav">
                    <div><strong>Time Offset:</strong></div> <div>${hardwareData.TimeOffset}</div>
                </div>

                <h2>Hardware Information</h2>
                ${Object.entries(hardwareData).map(([key, value]) => `
                    <div class="box-nav">
                        <div><strong>${key}:</strong></div> <div>${typeof value === 'object' ? JSON.stringify(value) : value}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Updating dynamic time every second
        setInterval(() => {
            document.getElementById("dynamic-time").textContent = new Date().toLocaleString();
        }, 1000);

    } catch (error) {
        infoDiv.textContent = `Error detecting hardware and environment information: ${error.message}`;
    }
}

detectHardwareAndEnvironment();

function hidePreloader() {
    setTimeout(() => {
        const preoloader = document.querySelector('.preoloader');
        preoloader.classList.add("not-act");
        document.body.style.position = "relative";
        setTimeout(() => preoloader.remove(), 1000);
    }, 1000)
}
window.addEventListener('load', hidePreloader);

////////////////////////////

async function detectHardwareAndEnvironment() {
    const infoDiv = document.getElementById("ip-hardware-info");

    try {
        let platformOc;
        let brands;
        let browser;

        if (navigator.userAgentData && navigator.userAgentData.brands) {
            platformOc = navigator.userAgentData.platform || 'Unknown';
            brands = navigator.userAgentData.brands || 'Unknown';
            browser = navigator.userAgentData.brands.slice(0, 2).map(brand => `${brand.brand} (ver.${brand.version})`).join(' / ');
        } else {
            platformOc = 'Unknown', brands = 'Unknown', browser = 'Unknown';
        }

        function getUTCOffset() {
            const offset = new Date().getTimezoneOffset();
            const hours = Math.floor(Math.abs(offset) / 60);
            const minutes = Math.abs(offset) % 60;
            const sign = offset <= 0 ? "+" : "-";

            return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        function formatToUTC(offset) {
            const sign = offset.startsWith('-') ? '-' : '+';
            const hours = offset.slice(1, 3);
            const minutes = offset.slice(3, 5);

            return `UTC${sign}${hours}:${minutes}`;
        }

        const logicalProcessors = navigator.hardwareConcurrency || 'Unknown';
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
        const platform = platformOc + " / " + navigator.platform || 'Unknown';
        const userAgent = navigator.userAgent || 'Unknown';
        const languages = navigator.languages || 'Unknown';

        const screenWidth = window.screen.width || 'Unknown';
        const screenHeight = window.screen.height || 'Unknown';
        const colorDepth = window.screen.colorDepth || 'Unknown';
        const pixelRatio = window.devicePixelRatio || 'Unknown';
        const orientation = screen.orientation ? screen.orientation.type : 'Unknown';

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timeOffset = getUTCOffset();

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let gpuInfo = 'Unknown', gpuVendor = 'Unknown';
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            gpuVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unavailable';
            gpuInfo = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
        }

        const performanceTest = (() => {
            const start = performance.now();
            for (let i = 0; i < 1e7; i++) { }
            return (performance.now() - start).toFixed(2) + ' ms';
        })();

        let batteryLevel = 'Unknown', isCharging = 'Unknown';
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            batteryLevel = (battery.level * 100).toFixed(0) + '%';
            isCharging = battery.charging ? 'Yes' : 'No';
        }

        const networkType = navigator.connection ? navigator.connection.effectiveType : 'Unknown';
        const networkSpeed = navigator.connection ? `${navigator.connection.downlink} Mbps` : 'Unknown';

        const deviceOrientation = 'DeviceOrientationEvent' in window ? 'Supported' : 'Not Supported';
        const deviceMotion = 'DeviceMotionEvent' in window ? 'Supported' : 'Not Supported';

        const features = {
            webRTC: !!navigator.mediaDevices,
            webGL: !!gl,
            serviceWorker: !!navigator.serviceWorker,
            pushNotifications: !!window.Notification,
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
        };

        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                document.querySelector('.ip').innerHTML = `
            <h2>IP Information</h2>
            <div class="box-nav">
                <div><strong>IP address:</strong></div> <div>${data.ip}</div>
            </div>
            <div class="box-nav">
                <div><strong>Network:</strong></div> <div>${data.network}</div>
            </div>
            <div class="box-nav">
                <div><strong>Version:</strong></div> <div>${data.version}</div>
            </div>
            <div class="box-nav">
                <div><strong>ASN:</strong></div> <div>${data.asn}</div>
            </div>
            <div class="box-nav">
                <div><strong>Organization:</strong></div> <div>${data.org}</div>
            </div>
            <div class="box-nav">
                <div><strong>Country:</strong></div> <div>${data.country_name}</div>
            </div>
            <div class="box-nav">
                <div><strong>Country Capital:</strong></div> <div>${data.country_capital}</div>
            </div>
            <div class="box-nav">
                <div><strong>Region:</strong></div> <div>${data.region}</div>
            </div>
            <div class="box-nav">
                <div><strong>City:</strong></div> <div>${data.city}</div>
            </div>
            <div class="box-nav">
                <div><strong>Postal:</strong></div> <div>${data.postal}</div>
            </div>
            <div class="box-nav">
                <div><strong>Country Calling Code:</strong></div> <div>${data.country_calling_code}</div>
            </div>
            <div class="box-nav">
                <div><strong>Currency:</strong></div> <div>${data.currency}</div>
            </div>
            <div class="box-nav">
                <div><strong>Time Zone:</strong></div> <div>${data.timezone}</div>
            </div>
            <div class="box-nav">
                <div><strong>Time Offset:</strong></div> <div>${formatToUTC(data.utc_offset)}</div>
            </div>
        `;
            }).catch(error => {
                document.querySelector('.ip').innerHTML = `
                <h2>IP Information</h2>
                <div class="box-nav">
                    <div><strong>Error fetching IP:</strong></div> <div>${error}</div>
                </div>
                `;
            }),

            infoDiv.innerHTML = `
        <div class="box">
            <h1>My IP Address</h1>
            <p class="ip"></p>

            <h2>Time Information</h2>
            <div class="box-nav">
                <div><strong>Local Time:</strong></div> <div id="dynamic-time"></div>
            </div>
            <div class="box-nav">
                <div><strong>Time Zone:</strong></div> <div>${timeZone}</div>
            </div>
            <div class="box-nav">
                <div><strong>Time Offset:</strong></div> <div>${timeOffset}</div>
            </div>

            <h2>Hardware Information</h2>
            <div class="box-nav">
                <div><strong>User Agent:</strong></div> <div>${userAgent}</div>
            </div>
            <div class="box-nav">
                <div><strong>Browser:</strong></div> <div>${browser}</div>
            </div>
            <div class="box-nav">
                <div><strong>Platform:</strong></div> <div>${platform}</div>
            </div>
            <div class="box-nav">
                <div><strong>Languages:</strong></div> <div>${languages}</div>
            </div>
            <div class="box-nav">
                <div><strong>Logical Processors:</strong></div> <div>${logicalProcessors}</div>
            </div>
            <div class="box-nav">
                <div><strong>Memory:</strong></div> <div>${memory}</div>
            </div>
            <div class="box-nav">
                <div><strong>GPU Vendor:</strong></div> <div>${gpuVendor}</div>
            </div>
            <div class="box-nav">
                <div><strong>GPU Renderer:</strong></div> <div>${gpuInfo}</div>
            </div>
            <div class="box-nav">
                <div><strong>Performance Test:</strong></div> <div>${performanceTest}</div>
            </div>
            <div class="box-nav">
                <div><strong>Online Status:</strong></div> <div>${navigator.onLine ? 'Online' : 'Offline'}</div>
            </div>

            <h2>Screen Information</h2>
            <div class="box-nav">
                <div><strong>Resolution:</strong></div> <div>${screenWidth} x ${screenHeight}</div>
            </div>
            <div class="box-nav">
                <div><strong>Color Depth:</strong></div> <div>${colorDepth}</div>
            </div>
            <div class="box-nav">
                <div><strong>Pixel Ratio:</strong></div> <div>${pixelRatio}</div>
            </div>
            <div class="box-nav">
                <div><strong>Orientation:</strong></div> <div>${orientation}</div>
            </div>

            <h2>Browser Features</h2>
            <div class="box-nav">
                <div><strong>WebRTC:</strong></div> <div>${features.webRTC ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>WebGL:</strong></div> <div>${features.webGL ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>Service Worker:</strong></div> <div>${features.serviceWorker ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>Push Notifications:</strong></div> <div>${features.pushNotifications ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>Local Storage:</strong></div> <div>${features.localStorage ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>Session Storage:</strong></div> <div>${features.sessionStorage ? 'Yes' : 'No'}</div>
            </div>
            <div class="box-nav">
                <div><strong>Geolocation:</strong></div> <div>${navigator.geolocation ? 'Supported' : 'Not Supported'}</div>
            </div>

            <h2>Network Information</h2>
            <div class="box-nav">
                <div><strong>Network Type:</strong></div> <div>${networkType}</div>
            </div>
            <div class="box-nav">
                <div><strong>Network Speed:</strong></div> <div>${networkSpeed}</div>
            </div>

            <h2>Battery Information</h2>
            <div class="box-nav">
                <div><strong>Battery Level:</strong></div> <div>${batteryLevel}</div>
            </div>
            <div class="box-nav">
                <div><strong>Charging:</strong></div> <div>${isCharging}</div>
            </div>

            <h2>Sensor Support</h2>
            <div class="box-nav">
                <div><strong>Device Orientation:</strong></div> <div>${deviceOrientation}</div>
            </div>
            <div class="box-nav">
                <div><strong>Device Motion:</strong></div> <div>${deviceMotion}</div>
            </div>
        </div>
        `;

        setInterval(() => {
            document.getElementById("dynamic-time").textContent = new Date().toLocaleString();
        }, 1000);

    } catch (error) {
        infoDiv.textContent = `Error detecting hardware and environment information: ${error.message}`;
    }

    const pgsCprght = document.createElement('div');
    pgsCprght.className = 'pgs-cprght';
    pgsCprght.innerHTML = `<a href="https://ivanwebstudio.site" target="_balnk">${new Date().getFullYear()} © Ivanwebstudio</a>`;
    document.body.appendChild(pgsCprght);
}

detectHardwareAndEnvironment();

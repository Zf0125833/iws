function hidePreloader() {
    setTimeout(() => {
        const preoloader = document.querySelector('.preoloader');
        preoloader.classList.add("not-act");
        document.body.style.position = "static";
        setTimeout(() => preoloader.remove(), 1200);
    }, 600)
}
window.addEventListener('load', hidePreloader);

////////////////////////////

async function detectHardwareAndEnvironment() {
    const infoDiv = document.getElementById("ip-hardware-info");

    try {
        let brands;
        let browser;

        const logicalProcessors = navigator.hardwareConcurrency || 'Unknown';
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
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

        const parsedData = {
            browser: /Chrome\/[0-9.]+/.test(userAgent)
                ? `Chrome ${userAgent.match(/Chrome\/([0-9.]+)/)[1]}`
                : /Firefox\/[0-9.]+/.test(userAgent)
                    ? `Firefox ${userAgent.match(/Firefox\/([0-9.]+)/)[1]}`
                    : /Safari\/[0-9.]+/.test(userAgent) && !/Chrome/.test(userAgent)
                        ? `Safari ${userAgent.match(/Version\/([0-9.]+)/)[1]}`
                        : /Edg\/[0-9.]+/.test(userAgent)
                            ? `Edge ${userAgent.match(/Edg\/([0-9.]+)/)[1]}`
                            : "Unknown Browser",

            os: /Windows NT/.test(userAgent)
                ? `Windows ${userAgent.match(/Windows NT ([0-9.]+)/)[1]}`
                : /Mac OS X/.test(userAgent)
                    ? `MacOS ${userAgent.match(/Mac OS X ([0-9_]+)/)[1].replace(/_/g, ".")}`
                    : /Android/.test(userAgent)
                        ? `Android ${userAgent.match(/Android ([0-9.]+)/)[1]}`
                        : /iPhone OS/.test(userAgent)
                            ? `iOS ${userAgent.match(/iPhone OS ([0-9_]+)/)[1].replace(/_/g, ".")}`
                            : "Unknown OS",

            device: /Mobile/.test(userAgent) ? "Mobile" : "Desktop",
        };

        if (navigator.userAgentData && navigator.userAgentData.brands) {
            brands = navigator.userAgentData.brands || 'Unknown';
            browser = navigator.userAgentData.brands.slice(0, 2).map(brand => `${brand.brand} (ver.${brand.version})`).join(' / ');
        } else {
            brands = 'Unknown', browser = parsedData.browser || 'Unknown';
        }

        function getUTCOffset() {
            const offset = new Date().getTimezoneOffset();
            const hours = Math.floor(Math.abs(offset) / 60);
            const minutes = Math.abs(offset) % 60;
            const sign = offset <= 0 ? "+" : "-";

            return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        function formatToUTC(offset) {
            const sign = offset.startsWith('-') ? '-' : '+';
            const hours = offset.slice(1, 3);
            const minutes = offset.slice(3, 5);

            return `${sign}${hours}:${minutes}`;
        }

        function addUTCOffset(offset) {
            const now = new Date();
            const sign = offset.startsWith('+') ? 1 : -1;
            const hours = parseInt(offset.slice(1, 3), 10);
            const minutes = parseInt(offset.slice(3, 5), 10);
            const offsetInMilliseconds = sign * ((hours * 60 + minutes) * 60 * 1000);

            const adjustedDate = new Date(now.getTime() + offsetInMilliseconds);

            return adjustedDate;
        }

        const localTime = () => {
            let date = new Date();
            let offsetMinutes = date.getTimezoneOffset();
            date.setMinutes(date.getMinutes() - offsetMinutes);
            return date.toUTCString() + ' ' + timeOffset
        }

        if (!navigator.onLine) {
            const offlineSt = document.createElement('div');
            offlineSt.className = 'offline-st';
            document.body.appendChild(offlineSt);
            document.querySelector('.offline-st').innerHTML = `<h1 style="margin-bottom:20px">OFFLINE</h1><p>You are currently offline, so some features of this page may be unavailable. <br/>Please check your internet connection and refresh the page to continue.</p>`;
        }

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
                <div><strong>Organization:</strong></div> <div>${data.asn + ', ' + data.org}</div>
            </div>
            <div class="box-nav">
                <div><strong>Languages:</strong></div> <div>${data.languages}</div>
            </div>
            <div class="box-nav">
                <div><strong>Country:</strong></div> <div>${data.country_name}</div>
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
                <div><strong>Local Time:</strong></div> <div>${addUTCOffset(data.utc_offset).toUTCString() + ' ' + formatToUTC(data.utc_offset)}</div>
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
            <div class="hello">
                <h1>IP Address</h1>
                <p>Here you can find out what information your browser reveals.</p>
            </div>
            <p class="ip"></p>

            <h2>Time Information</h2>
            <div class="box-nav">
                <div><strong>Time Zone:</strong></div> <div>${timeZone}</div>
            </div>
            <div class="box-nav">
                <div><strong>Local Time:</strong></div> <div>${localTime()}</div>
            </div>

            <h2>Hardware Information</h2>
            <div class="box-nav">
                <div><strong>User Agent:</strong></div> <div>${userAgent}</div>
            </div>
            <div class="box-nav">
                <div><strong>Browser:</strong></div> <div>${browser}</div>
            </div>
            <div class="box-nav">
                <div><strong>Platform:</strong></div> <div>${parsedData.device + " / " + parsedData.os}</div>
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

    } catch (error) {
        infoDiv.textContent = `Error detecting hardware and environment information: ${error.message}`;
    }

    const pgsCprght = document.createElement('div');
    pgsCprght.className = 'pgs-cprght';
    pgsCprght.innerHTML = `<a href="https://ivanwebstudio.site"><div class="logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><polygon points="74.3,27.5 84.7,46 89.2,32.6 92.4,33.6 85.4,54.6 75.1,35.9 70.5,49.6 67.3,48.6 "></polygon><polygon points="67.3,59.5 66.2,62.7 57.8,59.8 55.5,66.9 63.9,69.7 62.8,72.9 51,68.9 58.2,47.4 69.9,51.3 68.9,54.4 60.5,51.6 58.8,56.6 "></polygon><polygon points="44.5,17.5 45.6,33 55.7,21.3 59.3,22.5 43.1,40.4 41,16.4 "></polygon><rect x="23.3" y="24.1" transform="matrix(0.3169 -0.9485 0.9485 0.3169 -0.9868 50.2097)" width="22.1" height="3.5"></rect><polygon points="32,38.6 32.8,52.8 42.4,42.1 43.8,56.5 53,45.6 56.4,46.8 40.6,65.4 39.4,51.1 29.9,61.8 28.4,37.4 "></polygon><path d="M23.8,74.6c-1,0.4-2.2,0.5-3.4,0.1c-1-0.3-1.8-0.9-2.3-1.7c-0.5-0.7-0.8-1.7-0.8-2.7l0.1-0.5l2.8-0.4l-0.1,0.9c-0.1,0.5,0,1,0.2,1.4c0.2,0.3,0.5,0.5,0.9,0.6c0.5,0.2,0.9,0.2,1.3,0c0.4-0.2,0.6-0.5,0.7-0.9c0.1-0.3,0.1-0.6,0-1c-0.1-0.4-0.4-0.7-0.9-1.1l-1.2-1.1c-0.8-0.6-1.2-1.3-1.5-2.1s-0.3-1.5,0-2.3c0.3-1,1-1.7,1.9-2c0.9-0.4,1.9-0.4,3,0c0.8,0.3,1.4,0.7,1.9,1.2c0.5,0.5,0.8,1.2,0.9,2l0.1,0.6L27.3,66l-1.9,0.5l-0.5,0.1l-0.1-0.7c-0.1-0.4-0.2-0.7-0.4-0.9c-0.2-0.2-0.3-0.3-0.6-0.4c-0.3-0.1-0.6-0.1-0.9,0c-0.3,0.1-0.4,0.3-0.5,0.6c-0.1,0.2,0,0.4,0,0.7c0.1,0.3,0.4,0.6,0.7,0.9l1.4,1.2c0.7,0.6,1.2,1.3,1.4,2c0.3,0.8,0.3,1.5,0,2.3C25.6,73.4,24.9,74.1,23.8,74.6z"></path><polygon points="37,69.3 33.8,68.3 30.6,77.8 27.9,76.9 31.1,67.4 27.9,66.3 28.8,63.8 37.8,66.8 "></polygon><path d="M46.3,77.8c-0.5,1.6-1.4,2.7-2.5,3.2c-1.2,0.6-2.5,0.6-4.2,0c-1.6-0.5-2.7-1.4-3.3-2.6c-0.5-1.1-0.6-2.5-0.1-4.1l2.4-7.2l2.7,0.9l-2.4,7.2c-0.3,0.9-0.3,1.7-0.1,2.2s0.8,0.9,1.6,1.2c0.8,0.3,1.5,0.3,2,0c0.5-0.3,1-0.9,1.3-1.8l2.4-7.2l2.7,0.9L46.3,77.8z"></path><rect x="53.9" y="79.6" transform="matrix(0.3169 -0.9485 0.9485 0.3169 -35.6697 112.5211)" width="12.7" height="2.8"></rect><path d="M76.2,83.7c-0.2-0.8-0.4-1.7-0.8-2.5c-0.4-0.7-1.1-1.5-1.8-2c-0.8-0.6-1.5-1.1-2.4-1.4c-0.9-0.3-1.9-0.4-2.7-0.4c-0.9,0-1.8,0.2-2.6,0.6c-0.9,0.4-1.6,0.8-2.2,1.5c-0.5,0.6-1,1.3-1.3,2.2c-0.3,0.8-0.3,1.7-0.3,2.5c0.2,0.8,0.4,1.7,0.8,2.5c0.5,0.8,1,1.6,1.7,2.1c0.8,0.6,1.5,1.1,2.4,1.4c0.9,0.3,1.9,0.4,2.7,0.4c0.9-0.1,1.9-0.3,2.6-0.7c0.9-0.4,1.6-0.8,2.2-1.5c0.6-0.7,1-1.4,1.3-2.2C76.2,85.5,76.2,84.6,76.2,83.7z M73.3,85.3c-0.2,0.6-0.4,1-0.8,1.4c-0.3,0.3-0.8,0.6-1.3,0.9c-0.5,0.2-1,0.3-1.6,0.4c-0.5,0.1-1.1,0-1.6-0.2s-1-0.4-1.4-0.8c-0.5-0.3-0.8-0.7-1-1.2c-0.3-0.4-0.5-0.9-0.5-1.5c0-0.6,0-1.1,0.2-1.6c0.2-0.5,0.4-1,0.8-1.4c0.3-0.3,0.8-0.6,1.3-0.9c0.5-0.2,1-0.3,1.6-0.4c0.5-0.1,1.1,0,1.6,0.2c0.5,0.2,1,0.4,1.4,0.8c0.4,0.4,0.8,0.7,1,1.2c0.2,0.5,0.3,1,0.5,1.5C73.5,84.3,73.4,84.8,73.3,85.3z"></path><path d="M63,23.7L46.3,41.4l3.6,1.2l4.5-4.9l7.2,2.4l0.7,6.6l3.6,1.2L63,23.7z M56.4,35.3l4.4-4.6l0.7,6.3L56.4,35.3z"></path><path d="M58.8,77.5c-0.1-1-0.5-1.9-1-2.6c-0.5-0.6-1.1-1.1-1.7-1.6c-0.7-0.5-1.8-0.9-3.5-1.5l-2.8-0.9l-4,12.1l3.3,1.1c1.4,0.5,2.4,0.7,3.2,0.7c0.8,0,1.5-0.1,2.2-0.3c1-0.3,1.7-0.9,2.4-1.5c0.7-0.8,1.2-1.6,1.6-2.5C58.8,79.5,58.9,78.4,58.8,77.5zM55.6,79.2c-0.2,0.7-0.5,1.3-0.9,1.7c-0.4,0.4-0.8,0.7-1.3,0.9c-0.4,0.2-0.8,0.2-1.3,0.1c-0.3,0-2.9-0.8-2.9-0.8l2.4-7c0,0,2.5,1,2.8,1.2c0.5,0.3,0.7,0.6,0.9,0.9c0.3,0.4,0.5,0.9,0.6,1.2C56,77.9,55.9,78.5,55.6,79.2z"></path><path d="M83.5,59.4c-0.1-1-0.5-1.9-1-2.6c-0.4-0.6-1-1.1-1.7-1.6c-0.8-0.4-1.8-0.8-3.4-1.4l-4.8-1.6l-7.2,21.4l4.8,1.6c2.1,0.7,3.6,1,4.6,1.1c1.1,0.1,2-0.1,2.8-0.5c0.8-0.4,1.5-0.9,2.1-1.6c0.6-0.7,0.9-1.5,1.2-2.3c0.5-1.5,0.5-2.8,0-4.1c-0.3-0.9-0.7-1.6-1.4-2.1c0.6-0.1,1.2-0.4,1.7-0.8c0.9-0.6,1.5-1.5,1.9-2.7C83.5,61.2,83.6,60.3,83.5,59.4z M77.7,70.8c-0.2,0.6-0.5,1.1-0.8,1.5c-0.4,0.4-0.8,0.6-1.3,0.8c-0.4,0.2-0.8,0.2-1.4,0.1c-0.6-0.2-1.5-0.4-2.8-0.8l-1.5-0.5l2.2-6.7l1.5,0.5l0.7,0.2c0.8,0.3,1.5,0.5,1.9,0.7c0.4,0.2,0.6,0.4,0.9,0.7c0.3,0.3,0.6,0.9,0.8,1.5C78,69.4,77.9,70.1,77.7,70.8z M79.7,61.4c-0.3,1-0.9,1.7-1.6,1.9c-0.7,0.2-2,0.1-3.6-0.4L73,62.4l2-6.1l1.5,0.5c2.2,0.7,2.9,1.4,3.2,1.9C80.1,59.3,80.1,60.2,79.7,61.4z"></path></svg></div>${new Date().getFullYear()} © Ivanwebstudio</a>`;
    document.body.appendChild(pgsCprght);

    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    document.querySelector(".box").appendChild(themeToggle);

    function setTheme(theme) {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    document.querySelector('.theme-toggle').addEventListener('click', () => {
        const currentTheme = document.body.className;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
}

detectHardwareAndEnvironment();

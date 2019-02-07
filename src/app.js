const $$ = document;
let IP = {
    get: (url, type) =>
        fetch(url, { method: 'GET' }).then((resp) => {
            if (type === 'text')
                return Promise.all([resp.ok, resp.status, resp.text(), resp.headers]);
            else {
                return Promise.all([resp.ok, resp.status, resp.json(), resp.headers]);
            }
        }).then(([ok, status, data, headers]) => {
            if (ok) {
                let json = {
                    ok,
                    status,
                    data,
                    headers
                }
                return json;
            } else {
                throw new Error(JSON.stringify(json.error));
            }
        }).catch(error => {
            throw error;
        }),
    parseIPCz88: (ip, elID) => {
        IP.get(`https://api.ttt.sh/ip/qqwry/${ip}`, 'json')
            .then(resp => {
                $$.getElementById(elID).innerHTML = resp.data.address;
            })
    },
    parseIPIpapi: (ip, elID) => {
        IP.get(`https://api.skk.moe/network/parseIp/v2/${ip}`, 'json')
            .then(resp => {
                $$.getElementById(elID).innerHTML = `${resp.data.country} ${resp.data.regionName} ${resp.data.city} ${resp.data.isp}`;
            })
    },
    getWebrtcIP: () => {
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        let pc = new RTCPeerConnection({ iceServers: [] }),
            noop = () => { };

        pc.createDataChannel('');
        pc.createOffer(pc.setLocalDescription.bind(pc), noop);
        pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
                $$.getElementById('ip-webrtc').innerHTML = '没有查询到 IP';
                return;
            }
            let ip = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
            $$.getElementById('ip-webrtc').innerHTML = ip;
            IP.parseIPCz88(ip, 'ip-webrtc-cz88');
            pc.onicecandidate = noop;
        };
    },
    getIpipnetIP: () => {
        IP.get('https://myip.ipip.net', 'text')
            .then(resp => $$.getElementById('ip-ipipnet').innerHTML = resp.data);
    },
    getTaobaoIP: (data) => {
        $$.getElementById('ip-taobao').innerHTML = data.ip;
        IP.parseIPCz88(data.ip, 'ip-taobao-cz88');
    },
    getIpsbIP: (data) => {
        $$.getElementById('ip-ipsb').innerHTML = data.address;
        $$.getElementById('ip-ipsb-geo').innerHTML = `${data.country} ${data.province} ${data.city} ${data.operator}`
    },
    getIpifyIP: () => {
        IP.get('https://api.ipify.org/?format=json', 'json')
            .then(resp => {
                $$.getElementById('ip-ipify').innerHTML = resp.data.ip;
                $$.getElementById('ip-ipify-1').innerHTML = resp.data.ip;
                return resp.data.ip;
            })
            .then(ip => {
                IP.parseIPCz88(ip, 'ip-ipify-cz88');
                IP.parseIPIpapi(ip, 'ip-ipify-ipapi');
            })
    },
};
window.ipCallback = (data) => IP.getTaobaoIP(data);
IP.getWebrtcIP();
IP.getIpipnetIP();
IP.getIpifyIP();
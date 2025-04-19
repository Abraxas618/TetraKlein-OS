FROM alpine:latest
RUN apk add --no-cache nginx openssl bash curl
RUN mkdir -p /ramdisk && mount -t tmpfs tmpfs /ramdisk
WORKDIR /ramdisk
RUN echo -e '#!/bin/sh\nwhile true; do dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64; sleep 1; done' > /greg.sh && chmod +x /greg.sh
RUN mkdir /etc/ssl/sovereign && openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/sovereign/key.pem -out /etc/ssl/sovereign/cert.pem -days 1 -nodes -subj "/CN=localhost"
RUN echo "<html><body><h1>TetraKlein SovereignOS Tactical Ready ✅</h1></body></html>" > /ramdisk/index.html
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'"]

#!/bin/bash
mkdir -p /etc/ssl/sovereign
openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/sovereign/key.pem -out /etc/ssl/sovereign/cert.pem -days 1 -nodes -subj "/CN=localhost"

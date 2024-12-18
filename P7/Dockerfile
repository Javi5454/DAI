FROM node:22.9.0-alpine3.20

WORKDIR /app

ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV JWT_SECRET="EsTa MisMa:i8775tyjk,"
ENV SECRET_KEY="clavesecretaDAI"
# En linux
ENV DB_HOST=mongo
ENV PORT=80
ENV HOST=localhost

COPY  package*.json /app

RUN npm ci --only=production && npm cache clean --force

COPY . /app

RUN chmod +x ./entry-point_tienda.sh

CMD ./entry-point_tienda.sh

EXPOSE 8000
FROM node:4.4-wheezy
RUN apt-get update

EXPOSE 3000
VOLUME ["/data/pyscript/logs", "/data/pyscript/configs"]

RUN mkdir -p /data/pyscript

WORKDIR /data/pyscript
ADD . /data/pyscript
RUN mkdir /data/pyscript/logs; exit 0
RUN npm install --registry=https://registry.npm.taobao.org

ENTRYPOINT node bin/www
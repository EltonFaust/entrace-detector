FROM bamos/openface

RUN apt-get update \
    && apt-get install -y curl git build-essential imagemagick graphicsmagick unzip --no-install-recommends

ENV PATH $PATH:/usr/bin

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash \
    && apt-get install -y nodejs

RUN pip2 install face_recognition
RUN pip2 install git+https://github.com/dpallot/simple-websocket-server.git
RUN pip2 install -U python-dotenv

VOLUME /face-detector
WORKDIR /face-detector

EXPOSE 3000

CMD /bin/bash -l -c '/face-detector/start-servers.sh'

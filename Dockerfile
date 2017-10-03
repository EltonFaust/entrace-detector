FROM bamos/openface

RUN apt-get update \
    && apt-get install -y curl git build-essential imagemagick graphicsmagick unzip --no-install-recommends

ENV PATH $PATH:/usr/bin

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash \
    && apt-get install -y nodejs

VOLUME /face-detector
WORKDIR /face-detector

EXPOSE 3000 8000 9000

CMD /bin/bash -l -c '/face-detector/start-servers.sh'

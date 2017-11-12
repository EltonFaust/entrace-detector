# Based on face_recognition Dockerfile

FROM python:3.4-slim

RUN apt-get -y update
RUN apt-get install -y --fix-missing \
    build-essential \
    cmake \
    gfortran \
    git \
    wget \
    curl \
    graphicsmagick \
    libgraphicsmagick1-dev \
    libatlas-dev \
    libavcodec-dev \
    libavformat-dev \
    libboost-all-dev \
    libgtk2.0-dev \
    libjpeg-dev \
    liblapack-dev \
    libswscale-dev \
    pkg-config \
    python3-dev \
    python3-numpy \
    software-properties-common \
    zip \
    && apt-get clean && rm -rf /tmp/* /var/tmp/*

RUN cd ~ && \
    mkdir -p dlib && \
    git clone -b 'v19.7' --single-branch https://github.com/davisking/dlib.git dlib/ && \
    cd  dlib/ && \
    python3 setup.py install --yes USE_AVX_INSTRUCTIONS


####### ADD NON FACE_RECOGNITION REQUIREMENTS

ENV PATH $PATH:/usr/bin

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash \
    && apt-get install -y nodejs

RUN pip3 install git+https://github.com/dpallot/simple-websocket-server.git
RUN pip3 install face_recognition

RUN pip3 install urllib3
RUN pip3 install six

VOLUME /face-detector
WORKDIR /face-detector

EXPOSE 3000

CMD /bin/bash -l -c '/face-detector/start-servers.sh'

#Download base image ubuntu 22.04
FROM ubuntu:22.04

# to be uncomment

# ENV NB_USER makerz
# ENV NB_UID 1000
# ENV HOME /home/${NB_USER}

# to be remove

USER root

ENV PYSPARK_PYTHON=python3
ENV PYSPARK_DRIVER_PYTHON=python3

RUN apt-get update && apt-get install -y \
    haveged \
    tar \
    wget \
    bash \
    rsync \
    gcc \
    libfreetype6-dev \
    libhdf5-serial-dev \
    libpng-dev \
    libzmq3-dev \
    python3 \
    python3-dev \
    python3-pip \
    unzip \
    pkg-config \
    software-properties-common \
    graphviz

# to be uncomment    

# RUN adduser --disabled-password \
#     --gecos "Default user" \
#     --uid ${NB_UID} \
#     ${NB_USER}

# Install OpenJDK-11
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;
    
# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME

RUN echo "export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/" >> ~/.bashrc

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# to be uncomment

# Make sure the contents of our repo are in ${HOME}
# USER root

# RUN chmod -R 777 /home/makerz
# RUN mkdir -p /home/makerz

# RUN chown -R ${NB_UID} ${HOME}
# USER ${NB_USER}

WORKDIR ${HOME}


COPY requirements.txt "./"

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

COPY . "./"

EXPOSE 8000
EXPOSE 5000

# CMD ["gnome-terminal", "--", "python3", "-m", "http.server", "8000"]
ENTRYPOINT ["./runner.sh"]
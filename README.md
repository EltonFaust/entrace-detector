## Build + RUN

```sh
docker build -t face-detector .
docker run -p 3000:3000 -it -v $(pwd):/face-detector face-detector
```


## Classificar imagens

```sh
docker run -p 3000:3000 -it -v $(pwd):/face-detector face-detector /face-detector/classifier.py
```


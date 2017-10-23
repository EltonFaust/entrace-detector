## Build + RUN

```sh
	docker build -t face-detector .
	docker run -p 3000:3000 -it -v $(pwd):/face-detector face-detector
	docker run -p 9000:9000 -p 8000:8000 -it -v $(pwd):/face-detector face-detector
	docker run -p 9000:9000 -p 8000:8000 -it -v $(pwd):/face-detector face-detector /bin/bash -l -c '/root/openface/demos/web/start-servers.sh'
```


## Classificar imagens

```sh
	docker run -p 9000:9000 -p 8000:8000 -it -v $(pwd):/face-detector face-detector /root/openface/util/align-dlib.py /face-detector/data/project_dataset/raw align outerEyesAndNose /face-detector/data/project_dataset/aligned/ --size 96
	docker run -p 9000:9000 -p 8000:8000 -it -v $(pwd):/face-detector face-detector /root/openface/batch-represent/main.lua -outDir /face-detector/data/project_dataset/features -data /face-detector/data/project_dataset/aligned
	docker run -p 9000:9000 -p 8000:8000 -it -v $(pwd):/face-detector face-detector /root/openface/demos/classifier.py train /face-detector/data/project_dataset/features
```


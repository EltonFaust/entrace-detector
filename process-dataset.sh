#!/bin/bash

set -e -u

echo "Removing hitory"
rm -rf /face-detector/data/project_dataset/aligned/*/
rm -rf /face-detector/data/project_dataset/aligned/cache.t7
rm -rf /face-detector/data/project_dataset/features/classifier.pkl
rm -rf /face-detector/data/project_dataset/features/labels.csv
rm -rf /face-detector/data/project_dataset/features/reps.csv

echo "Generating aligned"
/root/openface/util/align-dlib.py /face-detector/data/project_dataset/raw align outerEyesAndNose /face-detector/data/project_dataset/aligned/ --size 96
echo "Extracting features"
/root/openface/batch-represent/main.lua -outDir /face-detector/data/project_dataset/features -data /face-detector/data/project_dataset/aligned
echo "Training"
/root/openface/demos/classifier.py train /face-detector/data/project_dataset/features

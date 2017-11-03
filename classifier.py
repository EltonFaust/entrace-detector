import pickle
import os
import face_recognition

encodings = []
labels = []

for f in os.listdir('./data/dataset'):
	print 'Processing ' + f
	image = face_recognition.load_image_file('./data/dataset/' + f)
	encodings.append(face_recognition.face_encodings(image)[0])
	labels.append(os.path.splitext(f)[0])


print 'Writing data file'
with open('./data/face-classified-data.txt', 'w') as classifierFile:
    pickle.dump({'encodings': encodings, 'labels': labels}, classifierFile)


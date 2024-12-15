import util
import numpy as np
from keras.src.models.sequential import Sequential
from keras.src.layers.rnn.lstm import LSTM
from keras.src.layers.core.dense import Dense
from keras.src.layers.regularization.dropout import Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

def create_sequences(features, target, time_steps):
    X, y = [], []
    for i in range(len(features) - time_steps):
        X.append(features[i:i + time_steps])
        y.append(target[i + time_steps])
    return np.array(X), np.array(y)

def preprocessing_x_y_data():
    csv = util.get_csv()
    data = csv["data_frame"]

    # Raw X values
    features = data[["Open", "High", "Low", "Close", "Volume", "rsi_7", "rsi_14", "ema_34", "ema_89"]]

    # Binary classification -> Up/Down -> raw y values
    target = (data["Type"] == "U").astype(int)

    # Scale features
    scaler = MinMaxScaler()
    features_scaled = scaler.fit_transform(features)

    X, y = create_sequences(features_scaled, target.values, 60)

    return X, y

def train_data(x, y):
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, shuffle=False)

    # Build the LSTM model
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])),
        Dropout(0.2),
        LSTM(50),
        Dropout(0.2),
        Dense(1, activation="sigmoid")  # Binary classification
    ])

    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

    # Train the model
    history = model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))

    print(f"training loss: {history["loss"]}")
    print(f"training accuracy: {history["acc"]}")

    # Evaluate/test the model
    loss, accuracy = model.evaluate(X_test, y_test)

    print(f"test loss: {loss}")
    print(f"test accuracy: {accuracy}")

    return model

X, y = preprocessing_x_y_data()

trained_model = train_data(X, y)

predict = trained_model.predict(X[len(X) - 61:len(X) - 1])

print(f"predict: {np.argmax(predict)}")

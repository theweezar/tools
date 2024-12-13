import util
import numpy as np
from keras.src.models.sequential import Sequential
from keras.src.layers.rnn.lstm import LSTM
from keras.src.layers.core.dense import Dense
from keras.src.layers.regularization.dropout import Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# Example data preprocessing
csv = util.get_csv()
data = csv["data_frame"]
features = data[["Open", "High", "Low", "Close", "Volume", "rsi_7", "rsi_14", "ema_34", "ema_89"]]
target = (data["Close"].shift(-1) > data["Close"]).astype(int)  # Binary classification

# Scale features
scaler = MinMaxScaler()
features_scaled = scaler.fit_transform(features)

# Create sequences
def create_sequences(features, target, time_steps=30):
    X, y = [], []
    for i in range(len(features) - time_steps):
        X.append(features[i:i + time_steps])
        y.append(target[i + time_steps])
    return np.array(X), np.array(y)

time_steps = 5
X, y = create_sequences(features_scaled, target.values, time_steps)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

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

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy:.2f}")

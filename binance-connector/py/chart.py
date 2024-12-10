import matplotlib
import matplotlib.axes
import numpy as np
import pandas
import indicator

class Chart:
    def __init__(self, plt: matplotlib.axes.Axes):
        self.plt = plt
        self.initial_nd_array = np.array([])
        self.current_nd_array = np.array([])
        self.x_nd_timestamps = np.array(range(len([])))

    def set_initial_nd_array(self, input_nd_array: np.ndarray):
        self.initial_nd_array = input_nd_array
        self.current_nd_array = input_nd_array
        self.x_nd_timestamps = np.array(range(len(input_nd_array)))
        return self

    def show_trendline(self):
        m, b = np.polyfit(self.x_nd_timestamps, self.current_nd_array, 1)
        trendline = m * self.x_nd_timestamps + b
        self.plt.plot(self.x_nd_timestamps, trendline, label="Trendline", color="red")
        return self

    def show_standard_chart(self):
        self.plt.plot(self.x_nd_timestamps, self.initial_nd_array, label="Prices")
        self.plt.set_xlabel(f"Timestamps (Index) - Last price: {self.initial_nd_array[-1]}")
        self.plt.set_ylabel("Price")
        self.plt.grid(linestyle='--')
        self.plt.legend()
        return self

    def show_rsi(self, period: int):
        price_count = len(self.initial_nd_array)
        upper = np.full(price_count, 80)
        lower = np.full(price_count, 20)
        price_series = pandas.Series(self.initial_nd_array)
        rsi = indicator.calc_rsi(price_series, period)
        rsi_nd_array = np.array(rsi)
        self.plt.plot(self.x_nd_timestamps, rsi_nd_array, label="RSI")
        self.plt.plot(self.x_nd_timestamps, upper, color="blue")
        self.plt.plot(self.x_nd_timestamps, lower, color="blue")
        self.plt.set_xlabel(f"RSI({period}): {round(rsi_nd_array[-1], 2)}")
        self.plt.set_ylabel("Index")
        self.plt.set_ylim(ymin=0, ymax=100)
        self.plt.grid(linestyle='--')

        y_ticks = [i*10 for i in range(11)]
        self.plt.set_yticks(y_ticks)

        self.current_nd_array = rsi_nd_array
        return self
        
import numpy as np
import pandas
import os
import re
import sys
from view import View

# https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html
# https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html

def get_csv_frame():
    cwd = os.getcwd()
    csv_folder_path = ""

    if len(sys.argv) == 2:
        csv_folder_path = os.path.join(cwd, sys.argv[-1])
    else:
        csv_folder_path = os.path.join(cwd, "binance-connector", "ignore")

    files = [f for f in os.listdir(csv_folder_path) if os.path.isfile(os.path.join(csv_folder_path, f))]

    if len(files) == 0:
        raise Exception("Data not found.")

    if re.search("(.csv$)", files[0]) is None:
        raise Exception("CSV file not found")

    csv_file_path = os.path.join(csv_folder_path, files[0])
    return pandas.read_csv(csv_file_path, sep=",")

# Initial price data
frame = get_csv_frame()
symbol = frame['Symbol'][0]
y_prices = np.array(frame['Close Price'])
y_vols = np.array(frame['Volume'])

# Plot 2 charts, plot the prices and the trendline
view = View(3, y_prices)

view.get_chart(0).show_chart(xlabel=f"{symbol} Last").show_trendline().show_ema(34, "#FFA500").show_ema(89, "green")

view.get_chart(1).show_rsi(7).show_trendline()

view.get_chart(2).set_initial_nd_array(y_vols).show_chart(xlabel="VOL Last", ylabel="VOL").show_trendline()

view.show()
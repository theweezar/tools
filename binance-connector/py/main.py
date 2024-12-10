import numpy as np
import pandas
import os
import re
import sys
from view import View

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
y_prices = np.array(frame['Close Price'])

# Plot 2 charts, plot the prices and the trendline
view = View(2, y_prices)

view.get_chart(0).show_standard_chart().show_trendline()

view.get_chart(1).show_rsi(7).show_trendline()

view.show()
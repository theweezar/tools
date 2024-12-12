import pandas
import os
import re
import sys

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
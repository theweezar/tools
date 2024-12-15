import pandas
import os
import re
import sys
import json

def get_csv() -> dict[str, pandas.DataFrame]:
    cwd = os.getcwd()
    csv_folder_path = ""

    if len(sys.argv) == 2:
        csv_folder_path = os.path.join(cwd, sys.argv[-1])
    else:
        csv_folder_path = os.path.join(cwd, "binance-connector", "ignore")

    json_file = open(os.path.join(csv_folder_path, "fetch.json"))
    fetch_data = json.load(json_file)
    file_name = fetch_data["fileName"]

    if re.search("(.csv$)", file_name) is None:
        raise Exception("CSV not found")

    csv_file_path = os.path.join(csv_folder_path, file_name)

    return {
        "data_frame": pandas.read_csv(csv_file_path, sep=","),
        "file_name": file_name,
        "file_path": csv_file_path
    }
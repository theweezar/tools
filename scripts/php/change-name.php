<?php

$path    = 'D:/archive_begin/';

$files = scandir($path);

foreach ($files as $key => $file_name) {
    # code...
    if (strcmp($file_name, '.') === 0 || strcmp($file_name, '..') === 0) continue;

    $split_arr = preg_split("/(.*)_5840/", $file_name);

    if (count($split_arr) > 1) {
        $new_file_name = '5840' . $split_arr[1];

        var_dump($file_name);
        var_dump($new_file_name);

        rename($path . $file_name, $path . $new_file_name);
    }
}
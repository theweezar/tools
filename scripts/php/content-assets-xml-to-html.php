<?php

/**
 * php -f content-assets-xml-to-html.php ../12504_content_footer_v1.3 12504_Tumi_SG_content_asset.xml
 */

/**
 * Add trailing slashes to path
 */
function make_path($path) {
    $clone_path = trim($path);

    if (strcmp($clone_path, '') === 0) return '';

    $clone_path = rtrim($clone_path, '/') . '/';
    $clone_path = '/' . ltrim($clone_path, '/');

    return $clone_path;
}

$src_xml_dir = getcwd() . make_path($argv[1] ?? '');

// Check source directory whether it exists or not
if (!file_exists($src_xml_dir)) {
    echo PHP_EOL . 'Source directory: ' . $src_xml_dir . PHP_EOL;
    die('Error: Source directory does not exist.' . PHP_EOL);
}

$src_xml_file = trim($argv[2] ?? '');

// Check xml file string whether it is the path or just a file name
if (strpos($src_xml_file, '/') !== false) {
    die('Error: Enter the second agrument as a file name, not a path.');
}

// Check file extension
if (strtolower(pathinfo($src_xml_file)['extension']) !== 'xml') {
    die('Error: Wrong file type. Only accept XML file.' . PHP_EOL);
}

// Check the file whether it exists or not
if (!file_exists($src_xml_dir . $src_xml_file)) {
    die('Error: The XML file does not exist.' . PHP_EOL);
}

// Create the html raw folder
$des_html_dir = $src_xml_dir . "html_raw/";
if (!file_exists($des_html_dir)) {
    mkdir($des_html_dir);
}

echo PHP_EOL . 'Source directory: ' . $src_xml_dir . PHP_EOL;
echo PHP_EOL . 'File: ' . $src_xml_file . PHP_EOL;

$xml_data = simplexml_load_file($src_xml_dir . $src_xml_file) or die('Error: Failed to load' . PHP_EOL);

$content_count = 0;

foreach ($xml_data as $key => $xml_content) {
    $content_count++;
    // Node <content content-id="..."></content>
    $node_content_attr = $xml_content->attributes();

    // HTML file name will be the content ID
    $content_id = $node_content_attr->{"content-id"};

    if (!isset($content_id)) continue;

    $html_name = $content_id->__toString();

    // Node custom-attribute with xml:lang
    $html_content_list = $xml_content->{"custom-attributes"}->{"custom-attribute"};

    if (!isset($html_content_list) || empty($html_content_list)) continue;

    for ($i=0; $i < count($html_content_list); $i++) {
        $html = $html_content_list[$i];

        $matches = array();

        preg_match("/xml:lang=\"(.*)\">/", $html->asXML(), $matches);

        $locale = $matches[1];

        $output_html_file_name = $html_name . "_" . $locale . ".html";

        $html_path = $des_html_dir . $output_html_file_name;

        file_put_contents($html_path, $html);

        echo PHP_EOL . 'Created file ' . $output_html_file_name . PHP_EOL;
    }
}

echo PHP_EOL . 'Parsed total: ' . $content_count . ' content(s) ' . PHP_EOL;
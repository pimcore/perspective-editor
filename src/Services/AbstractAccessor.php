<?php


namespace Pimcore\Bundle\PerspectiveEditorBundle\Services;


abstract class AbstractAccessor {

    protected $configDirectory;
    protected $configuration;

    public function __construct(string $configDirectory) {
        $this->configDirectory = $configDirectory;
    }

    protected function pretty_export($var, $indent = '') {
        switch (gettype($var)) {
            case 'array':
                $indexed = array_keys($var) === range(0, count($var) - 1);
                $r = [];
                foreach ($var as $key => $value) {
                    $r[] = "$indent    "
                        . ($indexed ? "" : $this->pretty_export($key) . ' => ')
                        . $this->pretty_export($value, "$indent    ");
                }
                return "[\n" . implode(",\n", $r) . "\n" . $indent . ']';
            case 'string': return '"' . addcslashes(str_replace('"', '"', $var), "\\\$\r\"\n\t\v\f") . '"';
            case 'boolean': return $var ? 'true' : 'false';
            case 'integer':
            case 'double': return $var;
            default: return var_export($var, true);
        }
    }

    public function getConfiguration(){
        if(!file_exists($this->configDirectory.$this->filename)){
            return false;
        }

        return include($this->configDirectory.$this->filename);
    }

    public function writeConfiguration($treeStore){
        $configuration = $this->convertTreeStoreToConfiguration($treeStore);

        $str = "<?php\n return " . $this->pretty_export($configuration) . ";";
        file_put_contents($this->configDirectory.$this->filename, $str);
    }

    abstract protected function convertTreeStoreToConfiguration($treeStore);
    abstract public function createFile();
}

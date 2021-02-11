<?php

namespace PerspectiveEditorBundle\Controller;

use PerspectiveEditorBundle\Services\PerspectiveAccessor;
use PerspectiveEditorBundle\Services\TreeHelper;
use PerspectiveEditorBundle\Services\ViewAccessor;
use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class PerspectiveController
 * @package PerspectiveEditorBundle\Controller\Admin
 */
class PerspectiveController extends AdminController {

    /**
     * @Route("/perspective/get-tree", name="get-perspective-tree")
     * @param PerspectiveAccessor $perspectiveAccessor
     * @param TreeHelper $treeHelper
     * @return JsonResponse
     */
    public function getPerspectiveTreeAction(PerspectiveAccessor $perspectiveAccessor, TreeHelper $treeHelper){
        $tree = [];
        $configuration = $perspectiveAccessor->getConfiguration();

        if($configuration){
            foreach($configuration as $perspectiveName => $perspectiveConfig){
                $tree[] = $this->createPerspectiveEntry($treeHelper, $perspectiveName, $perspectiveConfig);
            }
        }

        return new JsonResponse($tree);
    }

    /**
     * @Route("/view/get-tree", name="get-view-tree")
     * @param ViewAccessor $viewAccessor
     * @param TreeHelper $treeHelper
     * @return JsonResponse
     */
    public function getViewTreeAction(ViewAccessor $viewAccessor, TreeHelper $treeHelper){
        $tree = [];

        $configuration = $viewAccessor->getConfiguration();

        if($configuration){
            foreach($configuration['views'] as $viewName => $viewConfig){
                $tree[] = $this->createViewEntry($treeHelper, $viewName, $viewConfig);
            }
        }

        return new JsonResponse($tree);
    }

    /**
     * @Route("/perspective/update", name="update-perspective")
     * @param PerspectiveAccessor $perspectiveAccessor
     * @param Request $request
     * @return JsonResponse
     */
    public function updatePerspectivesAction(PerspectiveAccessor $perspectiveAccessor, Request $request){
        $ret = [
            'success' => true,
            'error' => null
        ];
        try{
            $treeStore = json_decode($request->get('data'), true);

            $this->checkForUniqueElements($treeStore);

            $perspectiveAccessor->writeConfiguration($treeStore);
        } catch(\Exception $e){
            $ret['success'] = false;
            $ret['error'] = $e->getMessage();
        }

        return new JsonResponse($ret);
    }

    /**
     * @Route("/view/update", name="update-view")
     * @param ViewAccessor $viewAccessor
     * @param Request $request
     * @return JsonResponse
     */
    public function updateViewAction(ViewAccessor $viewAccessor, Request $request){
        $ret = [
            'success' => true,
            'error' => null
        ];
        try{
            $treeStore = json_decode($request->get('data'), true);
            $viewAccessor->writeConfiguration($treeStore);
        } catch(\Exception $e){
            $ret = ['success' => false, 'error' => $e->getMessage()];
        }

        return new JsonResponse($ret);
    }

    protected function checkForUniqueElements(array $treeStore){
        foreach($treeStore['children'] ?? [] as $perspective){
            $elementTree = array_values(array_filter($perspective['children'] ?? [], function($entry){
                return $entry['type'] == 'elementTree';
            }));

            if(sizeof($elementTree) == 0){
                return;
            }

            $elements = array_values(array_filter($elementTree[0]['children'] ?? [], function($entry){
                return in_array($entry['config']['type'], ['assets', 'documents', 'objects']);
            }));

            if(sizeof($elements) > 3){
                throw new \Exception('plugin_pimcore_perspectiveeditor_no_unique_treeelements');
            }
        }
    }

    protected function createPerspectiveEntry(TreeHelper $treeHelper, $perspectiveName, $perspectiveConfig){
        return [
            'id' => $treeHelper->createUuid(),
            'text' => $perspectiveName,
            'name' => $perspectiveName,
            'type' => 'perspective',
            'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/integrated_webcam.svg',
            'expanded' => false,
            'children' => [
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => 'icon',
                    'type' => 'icon',
                    'leaf' => true,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/asset.svg',
                    'config' => [
                        'iconCls' => $perspectiveConfig['iconCls'] ?? null,
                        'icon' => $perspectiveConfig['icon'] ?? null
                    ],
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => 'elementTree',
                    'type' => 'elementTree',
                    'leaf' => !isset($perspectiveConfig['elementTree']),
                    'expanded' => isset($perspectiveConfig['elementTree']),
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/parallel_tasks.svg',
                    'children' => $this->buildElementTree($treeHelper, $perspectiveConfig),
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => 'dashboard',
                    'type' => 'dashboard',
                    'leaf' => sizeof(array_diff(array_keys($perspectiveConfig['dashboards'] ?? []), ['disabledPortlets'])) == 0,
                    'expanded'=> sizeof(array_diff(array_keys($perspectiveConfig['dashboards'] ?? []), ['disabledPortlets'])) != 0,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/star.svg',
                    'config' => $perspectiveConfig['dashboards']['disabledPortlets'] ?? [],
                    'children' => $this->buildDashboardTree($treeHelper, $perspectiveConfig),
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => 'toolbar',
                    'type' => 'toolbar',
                    'leaf' => true,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/support.svg',
                    'config' => $perspectiveConfig['toolbar'] ?? []
                ]
            ]
        ];
    }

    protected function buildElementTree(TreeHelper $treeHelper, $config){
        if(!isset($config['elementTree'])){
            return [];
        }

        $treeIcons = [
            'documents' => 'pimcore_icon_document',
            'assets' => 'pimcore_icon_asset',
            'objects' => 'pimcore_icon_object',
            'customview' => 'pimcore_icon_custom_views'
        ];

        $tree = [];
        foreach($config['elementTree'] as $element){
            $tree[] = [
                'id' => $treeHelper->createUuid(),
                'text' => $element['type'],
                'type' => 'elementTreeElement',
                'leaf' => true,
                'iconCls' => $treeIcons[$element['type']],
                'config' => $element
            ];
        }

        return $tree;
    }

    protected function buildDashboardTree(TreeHelper $treeHelper, $config){
        if(!isset($config['dashboards'])){
            return [];
        }

        $tree = [];
        foreach($config['dashboards']['predefined'] as $dashboardName => $dashboardConfig){
            $tree[] = [
                'id' => $treeHelper->createUuid(),
                'text' => $dashboardName,
                'type' => 'dashboardDefinition',
                'leaf' => true,
                'iconCls' => 'pimcore_icon_gridconfig_operator_renderer',
                'config' => array_merge($dashboardConfig, ['name' => $dashboardName])
            ];
        }

        return $tree;
    }

    protected function createViewEntry(TreeHelper $treeHelper, $viewName = null, $viewConfig = null){
        $viewName = $viewName ?? 'new view ' . date('U');

        $entry = [
            'id' => $treeHelper->createUuid(),
            'text' => $viewConfig['name'] ?? $viewName,
            'name' => 'view',
            'type' => 'view',
            'icon' => $viewConfig['icon'] ?? '/bundles/pimcoreadmin/img/flat-color-icons/view_details.svg',
            'leaf' => true,
            'config' => $viewConfig ?? $this->getViewDefaultConfig($viewName)
        ];

        return $entry;
    }

    protected function getViewDefaultConfig($name){
        return [
            'name' => $name,
            'treetype' => 'document',
            'position' => 'left',
            'rootfolder' => '/',
            'showroot' => false,
            'sort' => 0
        ];
    }
}

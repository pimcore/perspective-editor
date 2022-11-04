<?php

/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PCL
 */

namespace Pimcore\Bundle\PerspectiveEditorBundle\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Pimcore\Bundle\AdminBundle\Security\CsrfProtectionHandler;
use Pimcore\Bundle\PerspectiveEditorBundle\PimcorePerspectiveEditorBundle;
use Pimcore\Bundle\PerspectiveEditorBundle\Services\PerspectiveAccessor;
use Pimcore\Bundle\PerspectiveEditorBundle\Services\TreeHelper;
use Pimcore\Bundle\PerspectiveEditorBundle\Services\ViewAccessor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class PerspectiveController
 *
 * @package Pimcore\Bundle\PerspectiveEditorBundle\Controller\Admin
 */
class PerspectiveController extends AdminController
{
    protected $disabledCssClass = 'pimcore_tree_node_disabled';

    /**
     * @Route("/perspective/get-tree", name="get-perspective-tree")
     *
     * @return JsonResponse
     */
    public function getPerspectiveTreeAction(PerspectiveAccessor $perspectiveAccessor, TreeHelper $treeHelper)
    {
        $this->checkPermission(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);

        $tree = [];
        $configuration = $perspectiveAccessor->getConfiguration();

        if ($configuration) {
            foreach ($configuration as $perspectiveName => $perspectiveConfig) {
                $tree[] = $this->createPerspectiveEntry($treeHelper, $perspectiveName, $perspectiveConfig);
            }
        }

        return new JsonResponse($tree);
    }

    /**
     * @Route("/view/get-tree", name="get-view-tree")
     *
     * @return JsonResponse
     */
    public function getViewTreeAction(ViewAccessor $viewAccessor, TreeHelper $treeHelper)
    {
        $this->checkPermission(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);

        $tree = [];

        $configuration = $viewAccessor->getConfiguration();

        if ($configuration) {
            foreach ($configuration['views'] as $viewName => $viewConfig) {
                $tree[] = $this->createViewEntry($treeHelper, $viewName, $viewConfig);
            }
        }

        return new JsonResponse($tree);
    }

    /**
     * @Route("/perspective/update", name="update-perspective")
     *
     * @return JsonResponse
     */
    public function updatePerspectivesAction(PerspectiveAccessor $perspectiveAccessor, Request $request, CsrfProtectionHandler $csrfProtectionHandler)
    {
        $csrfProtectionHandler->checkCsrfToken($request);
        $this->checkPermission(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);

        $ret = [
            'success' => true,
            'error' => null
        ];
        try {
            $treeStore = json_decode($request->get('data'), true);
            $deletedRecords = json_decode($request->get('deletedRecords'), true);
            $this->checkForUniqueElements($treeStore);

            $perspectiveAccessor->writeConfiguration($treeStore, $deletedRecords);
        } catch (\Exception $e) {
            $ret['success'] = false;
            $ret['error'] = $e->getMessage();
        }

        return new JsonResponse($ret);
    }

    /**
     * @Route("/view/update", name="update-view")
     *
     * @return JsonResponse
     */
    public function updateViewAction(ViewAccessor $viewAccessor, Request $request, CsrfProtectionHandler $csrfProtectionHandler)
    {
        $csrfProtectionHandler->checkCsrfToken($request);
        $this->checkPermission(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);
        $this->checkPermission(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT);

        $ret = [
            'success' => true,
            'error' => null
        ];
        try {
            $treeStore = json_decode($request->get('data'), true);
            $deletedRecords = json_decode($request->get('deletedRecords'), true);
            $viewAccessor->writeConfiguration($treeStore, $deletedRecords);
        } catch (\Exception $e) {
            $ret = ['success' => false, 'error' => $e->getMessage()];
        }

        return new JsonResponse($ret);
    }

    /**
     * @return void
     */
    protected function checkForUniqueElements(array $treeStore)
    {
        foreach ($treeStore['children'] ?? [] as $perspective) {
            $elementTree = array_values(array_filter($perspective['children'] ?? [], function ($entry) {
                return $entry['type'] == 'elementTree' || $entry['type'] == 'elementTreeRight';
            }));

            if (sizeof($elementTree) == 0) {
                return;
            }

            $elementTrees = [];
            foreach ($elementTree as $elementTreeItem) {
                if (isset($elementTreeItem['children'])) {
                    $elementTrees = array_merge($elementTrees, $elementTreeItem['children']);
                }
            }

            foreach (['assets', 'documents', 'objects'] as $type) {
                $elements = array_values(array_filter($elementTrees, function ($entry) use ($type) {
                    return $entry['config']['type'] == $type;
                }));

                if (sizeof($elements) > 1) {
                    throw new \Exception('plugin_pimcore_perspectiveeditor_no_unique_treeelements');
                }
            }
        }
    }

    /**
     * @param string $perspectiveName
     * @param mixed $perspectiveConfig
     *
     * @return array
     */
    protected function createPerspectiveEntry(TreeHelper $treeHelper, $perspectiveName, $perspectiveConfig)
    {
        $leftElementTrees = $this->buildElementTree($treeHelper, $perspectiveConfig, 'left');
        $rightElementTrees = $this->buildElementTree($treeHelper, $perspectiveConfig, 'right');
        $disabledClass = $perspectiveConfig['writeable'] ? '' : $this->disabledCssClass;

        return [
            'id' => $treeHelper->createUuid(),
            'text' => $perspectiveName,
            'name' => $perspectiveName,
            'type' => 'perspective',
            'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/reading.svg',
            'expanded' => false,
            'allowDrag' => false,
            'allowDrop' => false,
            'cls' => $disabledClass,
            'writeable' => $perspectiveConfig['writeable'],
            'children' => [
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => 'icon',
                    'type' => 'icon',
                    'leaf' => true,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/marker.svg',
                    'allowDrag' => false,
                    'allowDrop' => false,
                    'cls' => $disabledClass,
                    'writeable' => $perspectiveConfig['writeable'],
                    'config' => [
                        'iconCls' => $perspectiveConfig['iconCls'] ?? null,
                        'icon' => $perspectiveConfig['icon'] ?? null
                    ],
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => $this->trans('plugin_pimcore_perspectiveeditor_elementTreeLeft', [], 'admin'),
                    'type' => 'elementTree',
                    'leaf' => false,
                    'expanded' => !empty($leftElementTrees),
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/left_down2.svg',
                    'allowDrag' => false,
                    'allowDrop' => true,
                    'cls' => $disabledClass,
                    'writeable' => $perspectiveConfig['writeable'],
                    'children' => $leftElementTrees,
                ], [
                    'id' => $treeHelper->createUuid(),
                    'text' => $this->trans('plugin_pimcore_perspectiveeditor_elementTreeRight', [], 'admin'),
                    'type' => 'elementTreeRight',
                    'leaf' => false,
                    'expanded' => !empty($rightElementTrees),
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/right_down2.svg',
                    'allowDrag' => false,
                    'allowDrop' => true,
                    'cls' => $disabledClass,
                    'children' => $rightElementTrees,
                    'writeable' => $perspectiveConfig['writeable']
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => $this->trans('plugin_pimcore_perspectiveeditor_dashboard', [], 'admin'),
                    'type' => 'dashboard',
                    'leaf' => sizeof(array_diff(array_keys($perspectiveConfig['dashboards'] ?? []), ['disabledPortlets'])) == 0,
                    'expanded' => sizeof(array_diff(array_keys($perspectiveConfig['dashboards'] ?? []), ['disabledPortlets'])) != 0,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/dashboard.svg',
                    'config' => $perspectiveConfig['dashboards']['disabledPortlets'] ?? [],
                    'allowDrag' => false,
                    'allowDrop' => false,
                    'cls' => $disabledClass,
                    'writeable' => $perspectiveConfig['writeable'],
                    'children' => $this->buildDashboardTree($treeHelper, $perspectiveConfig),
                ],
                [
                    'id' => $treeHelper->createUuid(),
                    'text' => $this->trans('plugin_pimcore_perspectiveeditor_toolbar', [], 'admin'),
                    'type' => 'toolbar',
                    'leaf' => true,
                    'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/support.svg',
                    'allowDrag' => false,
                    'allowDrop' => false,
                    'cls' => $disabledClass,
                    'writeable' => $perspectiveConfig['writeable'],
                    'config' => $perspectiveConfig['toolbar'] ?? []
                ]
            ]
        ];
    }

    /**
     * @param mixed $config
     * @param string $position
     *
     * @return array
     */
    protected function buildElementTree(TreeHelper $treeHelper, $config, $position = 'left')
    {
        if (!isset($config['elementTree'])) {
            return [];
        }
        $disabledClass = $config['writeable'] ? '' : $this->disabledCssClass;

        $treeIcons = [
            'documents' => 'pimcore_icon_document',
            'assets' => 'pimcore_icon_asset',
            'objects' => 'pimcore_icon_object',
            'customview' => 'pimcore_icon_custom_views'
        ];

        $tree = [];
        foreach ($config['elementTree'] as $element) {
            if ($position === ($element['position'] ?? 'left')) {
                $tree[] = [
                    'id' => $treeHelper->createUuid(),
                    'text' => $element['type'],
                    'type' => 'elementTreeElement',
                    'leaf' => true,
                    'allowDrag' => true,
                    'iconCls' => $treeIcons[$element['type']],
                    'config' => $element,
                    'cls' => $disabledClass,
                    'writeable' => $config['writeable'],
                ];
            }
        }

        usort($tree, function ($item1, $item2) {
            return ($item1['config']['sort'] ?? 0) - ($item2['config']['sort'] ?? 0);
        });

        return $tree;
    }

    /**
     * @param mixed $config
     *
     * @return array
     */
    protected function buildDashboardTree(TreeHelper $treeHelper, $config)
    {
        if (!isset($config['dashboards'])) {
            return [];
        }
        $disabledClass = $config['writeable'] ? '' : $this->disabledCssClass;

        $tree = [];
        if (isset($config['dashboards']['predefined'])) {
            foreach ($config['dashboards']['predefined'] as $dashboardName => $dashboardConfig) {
                $tree[] = [
                    'id' => $treeHelper->createUuid(),
                    'text' => $dashboardName,
                    'type' => 'dashboardDefinition',
                    'leaf' => true,
                    'allowDrag' => false,
                    'allowDrop' => false,
                    'iconCls' => 'pimcore_icon_welcome',
                    'cls' => $disabledClass,
                    'writeable' => $config['writeable'],
                    'config' => array_merge($dashboardConfig, ['name' => $dashboardName])
                ];
            }
        }

        return $tree;
    }

    /**
     * @param string $viewName
     * @param mixed $viewConfig
     *
     * @return array
     */
    protected function createViewEntry(TreeHelper $treeHelper, $viewName = null, $viewConfig = null)
    {
        $viewName = $viewName ?? 'new view ' . date('U');
        $disabledClass = '';
        if ($viewConfig) {
            $disabledClass = $viewConfig['writeable'] ? '' : ' ' . $this->disabledCssClass;
        }

        $entry = [
            'id' => $viewConfig['id'] ?? $treeHelper->createUuid(),
            'text' => $viewConfig['name'] ?? $viewName,
            'name' => 'view',
            'type' => 'view',
            'icon' => $viewConfig['icon'] ?? '/bundles/pimcoreadmin/img/flat-color-icons/view_details.svg',
            'cls' => 'plugin_pimcore_perspective_editor_custom_view_tree_item' . $disabledClass,
            'leaf' => true,
            'allowDrag' => true,
            'writeable' => $viewConfig['writeable'],
            'config' => $viewConfig ?? $this->getViewDefaultConfig($viewName)
        ];

        return $entry;
    }

    /**
     * @param string $name
     *
     * @return array
     */
    protected function getViewDefaultConfig($name)
    {
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

/**
 * The Layers section of the design panel: the project layers in burn order, each with an on/off checkbox, drag and
 * button reordering, and a click that opens the layer settings drawer; when the drawer closes the focus goes back to
 * the row. With no layers it shows a hint.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DragEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getLayerKeysWithMovedLayer } from '../../utils/layers/get.layer.keys.with.moved.layer';
import { getLayerPaletteEntry } from '../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { LayerToggled, LayersReordered, selectProjectLayers } from '../../utils/states/project.document.state';
import { LayerSettingsOpenChanged, selectOpenLayerSettingsKey } from '../../utils/states/ui.workbench.state';
import { LayerSettingsDrawer } from '../LayerSettingsDrawer';
import type { LayersSectionProps } from './interfaces/LayersSectionProps';
import { LayerRow } from './LayerRow';
import { LAYER_DRAG_DATA_TYPE, LAYER_DRAG_EFFECT } from './layers.section.constants';
import styles from './styles.module.scss';

export const LayersSection = ({ onEditPalette }: LayersSectionProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const openLayerKey: string | undefined = useSelector(selectOpenLayerSettingsKey);
  const [draggedLayerKey, setDraggedLayerKey] = useState<string | undefined>(undefined);
  const openButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map<string, HTMLButtonElement>());
  const closedLayerKeyRef = useRef<string | undefined>(undefined);
  const layerKeys: string[] = layers.map(getLayerKey);
  const openLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === openLayerKey,
  );

  const moveLayer = (movedKey: string, targetKey: string): void => {
    const movedKeys: string[] = getLayerKeysWithMovedLayer(layerKeys, movedKey, targetKey);

    if (movedKeys !== layerKeys) {
      dispatch(new LayersReordered({ layerKeys: movedKeys }));
    }
  };

  const moveLayerToIndex = (movedKey: string, targetIndex: number): void => {
    const targetKey: string | undefined = layerKeys[targetIndex];

    if (targetKey) {
      moveLayer(movedKey, targetKey);
    }
  };

  const startDrag = (dragEvent: DragEvent<HTMLLIElement>, layerKey: string): void => {
    dragEvent.dataTransfer.setData(LAYER_DRAG_DATA_TYPE, layerKey);
    dragEvent.dataTransfer.effectAllowed = LAYER_DRAG_EFFECT;
    setDraggedLayerKey(layerKey);
  };

  const dropOnLayer = (targetKey: string): void => {
    if (draggedLayerKey) {
      moveLayer(draggedLayerKey, targetKey);
    }

    setDraggedLayerKey(undefined);
  };

  const setOpenLayerKey = (layerKey: string | undefined): void => {
    dispatch(new LayerSettingsOpenChanged({ openLayerSettingsKey: layerKey }));
  };

  const closeLayerSettings = (): void => {
    closedLayerKeyRef.current = openLayerKey;
    setOpenLayerKey(undefined);
  };

  // Escape, the close button and a click on the bed all close the drawer; once it has closed, the keyboard user gets
  // back to the row that opened it instead of the page body.
  useEffect(() => {
    const closedLayerKey: string | undefined = closedLayerKeyRef.current;

    if (openLayerKey || !closedLayerKey) {
      return;
    }

    closedLayerKeyRef.current = undefined;
    openButtonsRef.current.get(closedLayerKey)?.focus();
  }, [openLayerKey]);

  const registerOpenButton = (layerKey: string, openButton: HTMLButtonElement | null): void => {
    if (openButton) {
      openButtonsRef.current.set(layerKey, openButton);
    } else {
      openButtonsRef.current.delete(layerKey);
    }
  };

  if (!layers.length) {
    return <p className={styles.hint}>{t(DEFAULT.LAYERS_EMPTY_HINT)}</p>;
  }

  return (
    <>
      <ul className={styles.list} aria-label={t(DEFAULT.LAYERS_LIST_LABEL)}>
        {layers.map((layer: ProjectLayer, layerIndex: number) => {
          const layerKey: string = getLayerKey(layer);

          return (
            <LayerRow
              key={layerKey}
              layer={layer}
              layerEntry={getLayerPaletteEntry(layer, paletteEntries)}
              isFirst={layerIndex === 0}
              isLast={layerIndex === layers.length - 1}
              isOpen={layerKey === openLayerKey}
              onOpen={() => setOpenLayerKey(layerKey)}
              openButtonRef={(openButton: HTMLButtonElement | null) => registerOpenButton(layerKey, openButton)}
              onToggle={(enabled: boolean) => dispatch(new LayerToggled({ layerKey, enabled }))}
              onMoveUp={() => moveLayerToIndex(layerKey, layerIndex - 1)}
              onMoveDown={() => moveLayerToIndex(layerKey, layerIndex + 1)}
              onDragStart={(dragEvent: DragEvent<HTMLLIElement>) => startDrag(dragEvent, layerKey)}
              onDragEnd={() => setDraggedLayerKey(undefined)}
              onDrop={() => dropOnLayer(layerKey)}
            />
          );
        })}
      </ul>
      <LayerSettingsDrawer
        layer={openLayer}
        onClose={closeLayerSettings}
        onEditPalette={onEditPalette}
      />
    </>
  );
};

/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./storage-class-details.scss";

import React from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { disposeOnUnmount, observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StorageClass } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { storageClassStore } from "./storage-class.store";
import { VolumeDetailsList } from "../+storage-volumes/volume-details-list";
import { volumesStore } from "../+storage-volumes/volumes.store";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import kubeWatchApiInjectable
  from "../../kube-watch-api/kube-watch-api.injectable";

interface Props extends KubeObjectDetailsProps<StorageClass> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer
}

@observer
class NonInjectedStorageClassDetails extends React.Component<Props & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        volumesStore,
      ]),
    ]);
  }

  render() {
    const { object: storageClass } = this.props;

    if (!storageClass) {
      return null;
    }

    if (!(storageClass instanceof StorageClass)) {
      logger.error("[StorageClassDetails]: passed object that is not an instanceof StorageClass", storageClass);

      return null;
    }

    const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);
    const { provisioner, parameters, mountOptions } = storageClass;

    return (
      <div className="StorageClassDetails">
        <KubeObjectMeta object={storageClass}/>

        {provisioner && (
          <DrawerItem name="Provisioner" labelsOnly>
            <Badge label={provisioner}/>
          </DrawerItem>
        )}
        <DrawerItem name="Volume Binding Mode">
          {storageClass.getVolumeBindingMode()}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {storageClass.getReclaimPolicy()}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}
        {parameters && (
          <>
            <DrawerTitle title="Parameters"/>
            {
              Object.entries(parameters).map(([name, value]) => (
                <DrawerItem key={name + value} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}
        <VolumeDetailsList persistentVolumes={persistentVolumes}/>
      </div>
    );
  }
}

export const StorageClassDetails = withInjectables<Dependencies, Props>(
  NonInjectedStorageClassDetails,

  {
    getProps: (di, props) => ({
      subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
      ...props,
    }),
  },
);


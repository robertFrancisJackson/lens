/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import webpackLensCommon from "./common";
import webpackLensMain from "./main";
import { webpackLensRenderer } from "./renderer";

const config = [
  webpackLensMain(),
  webpackLensRenderer(),
  webpackLensCommon(),
];

export default config;

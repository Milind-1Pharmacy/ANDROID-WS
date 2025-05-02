import {serverVersions, currentServerVersion} from './versionConfig';

export const config = {
  host: 'apiv2.1pharmacy.io',
  authority: 'apiv2.1pharmacy.io',
  origin: 'https://apiv2.1pharmacy.io',
  referer: 'https://apiv2.1pharmacy.io/',
  s3Base: 'https://1p-b2c-files.s3.amazonaws.com/',
  ...serverVersions[currentServerVersion],
};

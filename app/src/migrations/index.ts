import * as migration_20260901_084542_initial from './20260901_084542_initial';
import * as migration_20260904_015151_noi_dung_trang_chu from './20260904_015151_noi_dung_trang_chu';

export const migrations = [
  {
    up: migration_20260901_084542_initial.up,
    down: migration_20260901_084542_initial.down,
    name: '20260901_084542_initial',
  },
  {
    up: migration_20260904_015151_noi_dung_trang_chu.up,
    down: migration_20260904_015151_noi_dung_trang_chu.down,
    name: '20260904_015151_noi_dung_trang_chu'
  },
];

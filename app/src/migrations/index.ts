import * as migration_20260901_084542_initial from './20260901_084542_initial';
import * as migration_20260904_015151_noi_dung_trang_chu from './20260904_015151_noi_dung_trang_chu';
import * as migration_20260906_125026_them_cay_dich_vu from './20260906_125026_them_cay_dich_vu';
import * as migration_20260906_132705_them_van_ban_phap_luat from './20260906_132705_them_van_ban_phap_luat';
import * as migration_20260906_134710_them_nguyen_tac_hanh_nghe from './20260906_134710_them_nguyen_tac_hanh_nghe';
import * as migration_20260908_140000_them_hero_eyebrow from './20260908_140000_them_hero_eyebrow';

export const migrations = [
  {
    up: migration_20260901_084542_initial.up,
    down: migration_20260901_084542_initial.down,
    name: '20260901_084542_initial',
  },
  {
    up: migration_20260904_015151_noi_dung_trang_chu.up,
    down: migration_20260904_015151_noi_dung_trang_chu.down,
    name: '20260904_015151_noi_dung_trang_chu',
  },
  {
    up: migration_20260906_125026_them_cay_dich_vu.up,
    down: migration_20260906_125026_them_cay_dich_vu.down,
    name: '20260906_125026_them_cay_dich_vu',
  },
  {
    up: migration_20260906_132705_them_van_ban_phap_luat.up,
    down: migration_20260906_132705_them_van_ban_phap_luat.down,
    name: '20260906_132705_them_van_ban_phap_luat',
  },
  {
    up: migration_20260906_134710_them_nguyen_tac_hanh_nghe.up,
    down: migration_20260906_134710_them_nguyen_tac_hanh_nghe.down,
    name: '20260906_134710_them_nguyen_tac_hanh_nghe'
  },
  {
    up: migration_20260908_140000_them_hero_eyebrow.up,
    down: migration_20260908_140000_them_hero_eyebrow.down,
    name: '20260908_140000_them_hero_eyebrow',
  },
];

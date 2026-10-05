import Image from "next/image";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createTranslator } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { localizedHref } from "@/lib/nav";
import { getRequestLocale } from "@/lib/requestLocale";
import { mediaUrl, siteDisplayName } from "@/lib/site";
import type { Setting } from "@/payload-types";
import styles from "./Hero.module.css";

/**
 * Khối 2 — AUDIT §3.2: logo/tên site, tagline, nút CTA về /lien-he.
 *
 * Khối rating (điểm sao + số lượng khách hàng) đã gỡ: số chép từ site tham chiếu,
 * không kiểm chứng được. Chỉ dựng lại khi khách cung cấp số thật và chịu trách nhiệm.
 *
 * Dòng eyebrow trên slogan là CHỮ, không phải logo. Bản trước render
 * Settings.logo ở đây; khi khách upload logo thật (08/09) nó thành ra logo hiện
 * hai lần trong cùng khung nhìn (header + hero) và mất dòng eyebrow của Figma.
 * Figma đặt ở đây một dòng chữ ngắn ("Welcom to HiAcc" trong file gốc), nên chỗ
 * này bám chữ; logo chỉ còn ở header/footer.
 *
 * Có heroImage (Figma 05/10, node 1-1104): ảnh phủ kín section làm nền, chữ
 * nằm trong một card kính mờ căn giữa. Thay bố cục 2 cột chữ trái / ảnh phải cũ.
 * Không có ảnh thì rơi về 1 cột căn giữa trên nền gradient — khách xoá ảnh
 * trong admin cũng không làm vỡ trang.
 */
export async function Hero({ settings }: { settings: Setting | null }) {
  // Mọi link phải giữ ngôn ngữ đang xem, không thì bấm vào là rơi về bản tiếng Việt.
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE);
  // Mọi ô của banner nằm chung nhóm "① Banner đầu trang" (Settings → Trang chủ).
  const home = settings?.home;
  const heroImage = mediaUrl(home?.heroImage);
  const siteName = siteDisplayName(settings, locale);
  // Tagline ưu tiên nội dung khách sửa trong admin, không có thì rơi về khoá dịch.
  // Cùng quy tắc cho phần chữ còn lại: ô trống trong admin = dùng bản mặc định,
  // nên xoá nhầm một ô không làm mất chữ trên trang.
  const tagline = home?.heroTagline || t("home.hero.tagline");
  const lead = home?.heroLead || t("home.hero.lead");
  const cta = home?.heroCta || t("home.hero.cta");
  const ctaSecondary = home?.heroCtaSecondary || t("home.hero.ctaSecondary");
  // Eyebrow: ô trống trong admin thì rơi về khoá dịch, khoá dịch để trống nữa
  // thì dùng tên site — không bao giờ để hở một dòng rỗng trên đầu hero.
  const eyebrow = home?.heroEyebrow || t("home.hero.eyebrow") || siteName;
  // Độ mờ khung kính 0–100 từ admin, trống thì 70. Dùng ?? chứ không ||:
  // khách chọn 0 (trong suốt) là giá trị hợp lệ, không được rơi về mặc định.
  const blur = Math.min(100, Math.max(0, home?.heroBlur ?? 70)) / 100;
  const cardStyle = { "--hero-blur": blur } as CSSProperties;

  return (
    <section className={heroImage ? styles.heroBanner : styles.hero}>
      {/* Ảnh nền đứng trước Container trong DOM và nằm dưới bằng z-index;
          alt rỗng vì là ảnh trang trí, nội dung đã nằm trong card chữ. */}
      {heroImage ? (
        <Image
          className={styles.bg}
          src={heroImage}
          alt=""
          fill
          sizes="100vw"
          priority
        />
      ) : null}
      <Container>
        <div className={styles.inner}>
          <div
            className={heroImage ? styles.card : styles.copy}
            style={heroImage ? cardStyle : undefined}
          >
            <p className={styles.siteName}>{eyebrow}</p>

            <h1 className={styles.tagline}>{tagline}</h1>
            <p className={styles.lead}>{lead}</p>

            <div className={styles.actions}>
              <Button href={href("/lien-he")} size="lg">
                {cta}
              </Button>
              {/* Cuộn tới khối 5 nhóm dịch vụ ngay bên dưới. Trước đây nút này
                  trỏ /dich-vu — trang của cấu trúc cũ, đã bị cây dịch vụ thay
                  thế và gỡ khỏi repo. Neo trong trang đúng hơn một trang riêng:
                  danh sách nhóm đã nằm sẵn ở đây. */}
              <Button href="#linh-vuc" variant="outline" size="lg">
                {ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

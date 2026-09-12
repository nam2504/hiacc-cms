import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createTranslator } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { localizedHref } from "@/lib/nav";
import { getRequestLocale } from "@/lib/requestLocale";
import { mediaAlt, mediaUrl, siteDisplayName } from "@/lib/site";
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
 * Bố cục 2 cột (chữ trái / ảnh phải) từ 768px trở lên, CHỈ khi có heroImage.
 * Không có ảnh thì rơi về 1 cột căn giữa như cũ — khách xoá ảnh trong admin
 * cũng không làm vỡ trang.
 */
export async function Hero({ settings }: { settings: Setting | null }) {
  // Mọi link phải giữ ngôn ngữ đang xem, không thì bấm vào là rơi về bản tiếng Việt.
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE);
  const heroImage = mediaUrl(settings?.heroImage);
  const siteName = siteDisplayName(settings, locale);
  // Tagline ưu tiên nội dung khách sửa trong admin, không có thì rơi về khoá dịch.
  const tagline = settings?.tagline || t("home.hero.tagline");
  // Cùng quy tắc cho phần chữ còn lại: ô trống trong admin = dùng bản mặc định,
  // nên xoá nhầm một ô không làm mất chữ trên trang.
  const home = settings?.home;
  const lead = home?.heroLead || t("home.hero.lead");
  const cta = home?.heroCta || t("home.hero.cta");
  const ctaSecondary = home?.heroCtaSecondary || t("home.hero.ctaSecondary");
  // Eyebrow: ô trống trong admin thì rơi về khoá dịch, khoá dịch để trống nữa
  // thì dùng tên site — không bao giờ để hở một dòng rỗng trên đầu hero.
  const eyebrow = home?.heroEyebrow || t("home.hero.eyebrow") || siteName;

  return (
    <section className={styles.hero}>
      <Container>
        <div className={heroImage ? styles.innerSplit : styles.inner}>
          <div className={styles.copy}>
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

          {heroImage ? (
            <Image
              className={styles.image}
              src={heroImage}
              alt={mediaAlt(settings?.heroImage, "")}
              width={1200}
              height={800}
              sizes="(min-width: 900px) 50vw, 100vw"
              priority
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}

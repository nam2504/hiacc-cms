/**
 * English translation of the interface dictionary.
 *
 * These are UI strings only — nav labels, button labels, section headings,
 * form messages, error messages. CMS CONTENT (blog posts, service pages,
 * static pages) does NOT live here; it is entered per-language in /admin
 * with `localized: true`. This file is merged over `vi` in `i18n.ts` via
 * `getDictionary()` — any key missing here falls back to Vietnamese, so a
 * partial translation never leaks a raw key onto the page.
 */
export const en = {
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.services': 'Services',
  'nav.tools': 'Tools',
  'nav.tools.payroll': 'Gross ↔ Net Salary Calculator',
  'nav.contact': 'Contact',
  'nav.news': 'News',
  'nav.categories': 'Categories',

  'nav.menu.open': 'Open menu',
  'nav.menu.close': 'Close menu',
  'nav.skipToContent': 'Skip to main content',
  'service.requestQuote': 'Request a quote',
  'service.quickQuote.title': 'Need a quick quote?',
  'service.quickQuote.body': 'Call us or leave your details — HiACC replies with a quote within the working day.',
  'service.viewOwnPage': 'View as separate page',
  'service.stat.duration': 'Duration',
  'service.stat.feeFrom': 'Service fee from',
  'service.stat.sections': 'Content sections',
  'service.stat.updated': 'Updated',
  'service.related': 'You may also need',
  'nav.serviceGroup': 'Service group',
  'nav.servicePage': 'Service page →',
  'nav.language': 'Language',

  'common.readMore': 'Read more',
  'common.viewAll': 'View all',
  'common.backToHome': 'Back to home',
  'common.loading': 'Loading…',
  'common.hotline': 'Hotline',
  'common.email': 'Email',
  'common.address': 'Address',
  'common.taxCode': 'Tax code',
  'common.viewMap': 'View map',

  'footer.about': 'About us',
  'footer.quickLinks': 'Quick links',
  'footer.recentPosts': 'Recent posts',
  'footer.headOffice': 'Head office',
  'footer.contact': 'Contact',
  'footer.followUs': 'HiACC channels',

  'home.hero.eyebrow': 'Welcome to HiACC',
  'home.hero.tagline': 'Your partner for Vietnamese business',
  'home.hero.lead':
    'Full-service accounting, tax and business advisory for small and medium enterprises.',
  'home.hero.cta': 'Get a free consultation',
  'home.hero.ctaSecondary': 'View services',

  'home.stats.risk.value': 'Reduce',
  'home.stats.risk.label': 'tax and bookkeeping risk',
  'home.stats.efficiency.value': 'Improve',
  'home.stats.efficiency.label': 'accounting operations efficiency',
  'home.stats.cost.value': 'Optimise',
  'home.stats.cost.label': 'costs compared to an in-house accounting team',

  'home.about.title': 'About {brand}',
  'home.about.subtitle': 'Four reasons businesses choose {brand} as their accounting partner.',
  'home.about.certification.title': 'Standardised process',
  'home.about.certification.body':
    'A working process standardised to accounting and audit practice.',
  'home.about.team.title': 'Qualified team',
  'home.about.team.body':
    'A team of accounting and tax professionals working alongside every client.',
  'home.about.legal.title': 'Full legal standing',
  'home.about.legal.body':
    'Complete legal records, practising licences and professional liability insurance.',
  'home.about.support.title': '24/7 support',
  'home.about.support.body':
    'Advisors on hand all week, with responses within the working day.',

  'home.services.title': 'Services',
  'home.services.subtitle':
    'From full-service accounting to tax finalisation — find the right fit for your business.',

  'home.branches.title': 'Branch network',
  'home.branches.subtitle': 'Present in every major economic hub nationwide.',

  'home.social.title': 'Connect with {brand}',
  'home.social.subtitle':
    'Follow our official channels for the latest tax and legal updates.',
  'home.social.facebook': 'Facebook',
  'home.social.tiktok': 'TikTok',
  'home.social.youtube': 'YouTube',
  'home.social.twitter': 'Twitter (X)',

  'home.knowledge.title': 'Knowledge centre',
  'home.knowledge.subtitle': 'Articles and legal updates organised by topic.',
  'home.knowledge.group.accounting': 'Accounting & Business',
  'home.knowledge.group.legal-hr': 'Legal & HR',

  'home.services.viewAll': 'View all services',

  'home.consult.eyebrow': 'Free consultation',
  'home.consult.title': 'Get a free consultation',
  'home.consult.subtitle':
    'Leave your details — a {brand} specialist will contact you during working hours to advise on procedures and fees before starting.',

  'home.cta.title': 'Need advice for your business?',
  'home.cta.subtitle':
    'Send a request or call us directly — we respond within the working day.',
  'home.cta.button': 'Get a free consultation',

  'page.contentComingSoon': 'Content is being updated. Please check back later.',

  'services.listSubtitle':
    'Choose the service that fits your business — each one has its own detailed description.',
  'services.empty': 'No services have been published yet.',
  'services.sidebar.label': 'Service items',
  'services.sidebar.title': 'Contents',
  'services.pricingTable.title': 'Service price list',
  'services.pricingTable.item': 'Item',
  'services.pricingTable.scope': 'Scope of work',
  'services.pricingTable.fee': 'Service fee',
  'home.services.groupsTitle': 'What we do',
  'home.services.groupsSubtitle':
    'From full-service accounting to operating licences — pick exactly what your business needs.',
  'home.services.groupDetail': 'See details →',
  'home.services.consultCta': 'Free consultation',
  'home.services.pricingCta': 'Full price list',
  'service.cta': 'Get advice on this service',
  'service.backToList': 'View all services',

  'contact.subtitle':
    'Contact {brand} for free advice on accounting, tax and corporate legal matters.',
  'contact.headOffice': 'Head office',
  'contact.branches.title': 'Branch network',
  'contact.branches.subtitle': 'Choose the office nearest you for direct support.',
  'branches.empty': 'No branch information available yet.',

  'news.list.title': 'News',
  'news.list.subtitle':
    'Tax, accounting and corporate legal updates — from the {brand} team.',
  'news.list.latest': 'Latest articles',

  'news.categories.title': 'Categories',
  'news.categories.subtitle': 'Articles and legal updates organised by category.',
  'news.categories.empty.title': 'No categories yet',
  'news.categories.empty.body': 'Categories are being updated — please check back later.',
  'news.categories.count': '{count} articles',
  'news.categories.empty.badge': 'No articles yet',

  'news.empty.icon': 'newspaper',
  'news.empty.title': 'No articles yet',
  'news.empty.body': 'Articles are being prepared. In the meantime, browse the available categories.',
  'news.empty.browseCategories': 'Browse categories',

  'news.category.empty.title': 'No articles in this category yet',
  'news.category.empty.body':
    'Content is being prepared. In the meantime, take a look at our latest articles.',
  'news.category.empty.allPosts': 'View all articles',

  'news.post.contentPending': 'This article is being updated.',
  'news.post.backToList': '← Back to news',

  'news.pagination.label': 'Article pagination',
  'news.pagination.prev': 'Previous',
  'news.pagination.next': 'Next',
  'news.breadcrumb.label': 'Breadcrumb',

  'contact.form.title': 'Request a consultation',
  'contact.form.salutation.label': 'Title',
  'contact.form.salutation.mr': 'Mr.',
  'contact.form.salutation.ms': 'Ms.',
  'contact.form.fieldOfInterest.label': 'Field of interest',
  'contact.form.fieldOfInterest.placeholder': 'Select a field of interest',
  'contact.form.subtitle':
    'Leave your details and a {brand} advisor will contact you during business hours.',
  'contact.form.name.label': 'Full name',
  'contact.form.name.placeholder': 'John Smith',
  'contact.form.phone.label': 'Phone number',
  'contact.form.phone.placeholder': '0912 345 678',
  'contact.form.email.label': 'Email',
  'contact.form.email.placeholder': 'you@company.com',
  'contact.form.message.label': 'What do you need help with?',
  'contact.form.message.placeholder': 'Tell us what your business needs support with.',
  'contact.form.optional': '(optional)',
  'contact.form.requiredMark': 'Required',
  'contact.form.submit': 'Send request',
  'contact.form.submitting': 'Sending…',
  'contact.form.honeypot.label': 'Leave this field blank',
  'contact.form.success.title': 'We’ve received your request',
  'contact.form.success.body':
    'Thank you for contacting {brand}. An advisor will call you back during business hours.',
  'contact.form.success.again': 'Send another request',
  'contact.form.error.name': 'Please enter your full name.',
  'contact.form.error.phone': 'Please enter your phone number.',
  'contact.form.error.phoneFormat':
    'Invalid phone number. Use a format like 0912345678 or +84912345678.',
  'contact.form.error.email': 'Invalid email address.',
  'contact.form.error.tooLong': 'This message is too long — please shorten it.',
  'contact.form.error.rateLimit':
    'You’ve sent quite a few requests. Please try again in a few minutes or call our hotline.',
  'contact.form.error.duplicate': 'This request was just submitted — no need to send it again.',
  'contact.form.error.generic': 'We couldn’t send your request right now. Please try again later.',
  'contact.form.error.phoneFormat.v2': 'Invalid phone number format.',
  'contact.form.error.summary': 'Your request could not be sent. Please check the highlighted fields.',

  'branches.map.title': 'Branch map',
  'branches.map.show': 'Show map',
  'branches.map.hide': 'Hide map',
  'branches.map.frameTitle': 'Branch map',

  'error.notFound.title': 'Page not found',
  'error.notFound.body': 'The page you are looking for does not exist or has been moved.',

  'seo.siteName': '{brand} Accounting',
  'seo.home.title': 'Accounting, tax and business advisory services',
  'seo.breadcrumb.home': 'Home',
  'seo.placeholder.pending': 'Pending update',

  'payroll.title': 'Gross ↔ Net Salary Calculator',
  'payroll.subtitle':
    'Enter a Gross salary to see the take-home Net amount, or enter a Net salary to work out the Gross salary to negotiate.',
  'payroll.seo.description':
    'Convert Gross to Net and Net to Gross salary using the personal income tax brackets and insurance rates effective from 1 January 2026.',

  'payroll.direction.legend': 'Calculation direction',
  'payroll.direction.grossToNet': 'Gross → Net',
  'payroll.direction.netToGross': 'Net → Gross',

  'payroll.field.amount.gross': 'Gross salary (VND/month)',
  'payroll.field.amount.net': 'Net salary (VND/month)',
  'payroll.field.amount.hint': 'Enter an amount, e.g. 30000000.',
  'payroll.field.dependents': 'Number of dependants',
  'payroll.field.dependents.hint':
    'Number of dependants registered for personal relief. Enter 0 if none.',
  'payroll.field.region': 'Minimum wage region',
  'payroll.field.region.hint':
    'Determines the unemployment insurance contribution cap. If unsure, use Region I (major cities).',
  'payroll.field.region.option': 'Region',
  'payroll.field.customBase': 'Company contributes insurance on a different salary',
  'payroll.field.customBase.hint':
    'Tick only if the company pays insurance on a lower amount than the agreed salary. Leave blank to use the Gross salary.',
  'payroll.field.insuranceBase': 'Insurance contribution base (VND/month)',

  'payroll.result.title': 'Breakdown',
  'payroll.result.empty': 'Enter an amount to see the result.',
  'payroll.result.item': 'Item',
  'payroll.result.amount': 'Amount',
  'payroll.result.gross': 'Gross salary',
  'payroll.result.social': 'Social insurance',
  'payroll.result.health': 'Health insurance',
  'payroll.result.unemployment': 'Unemployment insurance',
  'payroll.result.totalInsurance': 'Total employee insurance contribution',
  'payroll.result.incomeBeforeTax': 'Income before tax',
  'payroll.result.deduction': 'Personal relief',
  'payroll.result.deduction.personal': 'self',
  'payroll.result.deduction.dependents': 'dependants',
  'payroll.result.taxableIncome': 'Assessable income',
  'payroll.result.tax': 'Personal income tax',
  'payroll.result.net': 'Net take-home salary',
  'payroll.result.capped': 'insurance contribution cap reached',

  'payroll.brackets.title': 'Tax by bracket',
  'payroll.brackets.hint':
    'Each bracket’s rate applies only to the portion of income within that bracket. The last column adds up to the total tax above.',
  'payroll.brackets.level': 'Bracket',
  'payroll.brackets.range': 'Assessable income range',
  'payroll.brackets.rate': 'Tax rate',
  'payroll.brackets.portion': 'Amount in bracket',
  'payroll.brackets.tax': 'Tax for this bracket',
  'payroll.brackets.none': 'Assessable income is zero, so no tax is due.',
  'payroll.brackets.above': 'and above',

  'payroll.legal.title': 'Figures currently applied',
  'payroll.legal.effectiveFrom': 'Effective from',
  'payroll.legal.basis': 'Legal basis',

  'payroll.disclaimer.title': 'Important note',
  'payroll.disclaimer.body':
    'This result is for reference only and does not replace professional tax or accounting advice. Figures are based on regulations effective from 1 January 2026 and may change. Please check against your labour contract and the tax authority before using this for official purposes.',
  'payroll.privacy':
    'All calculations run entirely in your browser. The salary figures you enter are never sent anywhere or stored.',

  'payroll.error.amount.invalid':
    'This amount could not be read. Try entering 30000000 or 30.000.000.',
  'payroll.error.amount.negative': 'The amount cannot be negative. Please enter a number greater than 0.',
  'payroll.error.dependents.invalid':
    'The number of dependants must be a whole number of 0 or more. Enter 0 if none.',
  'payroll.error.dependents.rounded': 'Calculating with the number of dependants rounded down to:',
  'payroll.result.summary.net': 'Net take-home salary',
  'payroll.result.summary.gross': 'Gross salary to negotiate',
  'payroll.brackets.card.level': 'Bracket',
  'nav.secondaryLinks': 'Secondary links',
  'nav.pricing': 'Pricing',
  'pricing.pending.title': 'Our price list is being updated',
  'pricing.pending.body':
    'Fees for each service are being finalised. In the meantime, call our hotline or send a request to get a quote matched to the size of your business.',
  'nav.legalDocs': 'Legal documents',
  'nav.newsletter': 'Newsletter',
  'legalDocs.kicker': 'Library',
  'legalDocs.title': 'Legal framework',
  'legalDocs.subtitle':
    'Laws, decrees and circulars covering accounting, tax, social insurance, labour, business registration, investment and commerce.',
  'about.profile.title': 'Company profile',
  'about.profile.companyName': 'Company name',
  'about.profile.taxCode': 'Tax code',
  'about.profile.headOffice': 'Head office',
  'about.profile.field': 'Sector',
  'about.profile.fieldValue': 'Accounting, tax and corporate legal procedures',
  'about.profile.slogan': 'Slogan',
  'about.principles.title': 'How we work',

} as const

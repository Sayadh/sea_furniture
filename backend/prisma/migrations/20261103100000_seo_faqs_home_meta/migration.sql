-- SEO content (data only, no schema change).
-- New FAQs are added after the existing ones; a FAQ whose question already exists is skipped,
-- so re-running never duplicates and nothing edited in Admin is overwritten.

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Որտե՞ղ գնել որակյալ կահույք Երևանում։', 'Sea Furniture-ը փափուկ կահույք է պատրաստում իր արտադրամասում Երևանում։ Կարող եք ընտրել պատրաստի մոդել կատալոգից կամ պատվիրել կահույք ձեր չափսերով։ Պատվեր կարող եք կատարել կայքից, հեռախոսով կամ WhatsApp-ով։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Որտե՞ղ գնել որակյալ կահույք Երևանում։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Առաքո՞ւմ եք կահույք Հայաստանի մարզեր։', 'Այո, առաքում ենք Հայաստանի բոլոր մարզերը, այդ թվում՝ Գյումրի, Վանաձոր, Աբովյան, Էջմիածին, Հրազդան և այլ քաղաքներ։ Մարզերի համար առաքման ժամկետը և արժեքը համաձայնեցնում ենք պատվերը հաստատելիս։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Առաքո՞ւմ եք կահույք Հայաստանի մարզեր։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Ի՞նչ երաշխիք եք տալիս կահույքի համար։', 'Կահույքի կարկասի, մեխանիզմների և կարերի համար տալիս ենք մինչև 2 տարի երաշխիք։ Երաշխիքի պայմանները ճշտում ենք պատվերը ձևակերպելիս։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Ի՞նչ երաշխիք եք տալիս կահույքի համար։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Ինչո՞վ է տարբերվում լավ բազմոցը էժանից։', 'Լավ բազմոցն ունի ամուր կարկաս, բարձր խտության սպունգ, դիմացկուն կտոր և որակյալ կարեր։ Այդպիսի բազմոցը տարիներով պահպանում է ձևն ու հարմարավետությունը, իսկ էժան մոդելները հաճախ արագ նստում և մաշվում են։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Ինչո՞վ է տարբերվում լավ բազմոցը էժանից։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Ինչպե՞ս խնամել փափուկ կահույքը։', 'Պարբերաբար մաքրեք կահույքը փոշեկուլով, հետքերը հեռացրեք անմիջապես և պաշտպանեք կահույքը արևի ուղիղ ճառագայթներից, որոնք գունաթափում են կտորը։ Կտորի խնամքի մասին մանրամասն խորհուրդներ կտանք ձեր ընտրած կտորի համար։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Ինչպե՞ս խնամել փափուկ կահույքը։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Պատրաստո՞ւմ եք կահույք սրճարանների համար։', 'Այո, պատրաստում ենք փափուկ աթոռներ և բազմոցներ սրճարանների համար՝ ցանկալի քանակով, չափսերով և կտորով։ Մանրամասները համաձայնեցնում ենք պատվերից առաջ։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Պատրաստո՞ւմ եք կահույք սրճարանների համար։');

INSERT INTO `Faq` (`id`, `question`, `answer`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT UUID(), 'Վերանորոգելուց հետո կահույքը կլինի՞ նորի պես։', 'Վերապաստառումից, սպունգի և անհրաժեշտ դետալների փոխարինումից հետո կահույքը ստանում է նոր տեսք և վերականգնում է հարմարավետությունը։ Արդյունքները կարող եք տեսնել «Մեր աշխատանքները» բաժնում։', true,
       (SELECT COALESCE(MAX(`f`.`sortOrder`), 0) + 1 FROM (SELECT `sortOrder` FROM `Faq`) AS `f`), NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM (SELECT `question` FROM `Faq`) AS `x` WHERE `x`.`question` = 'Վերանորոգելուց հետո կահույքը կլինի՞ նորի պես։');

-- Home page title/description: replaced only while they still have the original seed text
UPDATE `SiteSettings` SET `seoTitle` = 'Կահույք Երևանում — բազմոցներ և պատվերով կահույք | Sea Furniture' WHERE `key` = 'main' AND (`seoTitle` IS NULL OR `seoTitle` = 'Sea Furniture — փափուկ կահույքի վաճառք և վերանորոգում Երևանում');
UPDATE `SiteSettings` SET `seoDescription` = 'Կահույք Երևանում սեփական արտադրամասից․ բազմոցներ, բազկաթոռներ, պատվերով փափուկ կահույք և կահույքի վերանորոգում։ Առաքում ամբողջ Հայաստանում, մինչև 2 տարի երաշխիք։' WHERE `key` = 'main' AND (`seoDescription` IS NULL OR `seoDescription` = 'Փափուկ կահույքի վաճառք և վերանորոգում Երևանում․ բազմոցներ, բազկաթոռներ, աթոռներ, պատվերով կահույք, վերապաստառում և սպունգի փոխարինում։');

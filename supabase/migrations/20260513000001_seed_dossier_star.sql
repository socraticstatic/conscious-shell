-- supabase/migrations/20260513000001_seed_dossier_star.sql
-- Seeds STAR case study content for all 12 portfolio projects.
-- Matched by title. Idempotent (ON CONFLICT not needed — uses WHERE title =).

UPDATE portfolio_projects SET
  situation = $$When I joined AT&T, I was recognized as a subject-matter expert in Lifecycle Dashboards and entrusted with reshaping how the organization thought about API products.$$,
  task      = $$My responsibilities included reimagining the Cloud Management Platform and crafting a cohesive strategy connecting network APIs to developer-facing surfaces.$$,
  action    = $$I led the ideation process, promoting the concept of APIs as digital products, and designed the portal architecture and developer experience from concept to handoff.$$,
  result    = $$The API portal is still under development, but its clear vision shows significant promise. The revamped dashboard reduced analyst review time significantly and established a new design language adopted org-wide.$$
WHERE title = 'AT&T Product Design';

UPDATE portfolio_projects SET
  situation = $$A well-known product investor hired me to finalize the concept of a virtual card designed for managing recurring subscriptions using temporary credit cards — a challenge compounded by the need for intuitive design and clear taxonomy.$$,
  task      = $$My role was to design a user-friendly interface that allowed users to easily manage virtual cards for managing subscriptions, overcoming visual and organizational challenges.$$,
  action    = $$I employed a combination of low, mid, and high fidelity wireframes within Axure, alongside User Flows in Figma and Sketch, to develop intuitive task funnels. Interactive prototyping enabled rapid validation across key user personas.$$,
  result    = $$The implementation led to a 20% improvement in the completion rate of setup and key tasks. Qualitative feedback highlighted a significant increase in ease of use, with users describing the onboarding process as fun and enjoyable.$$
WHERE title = 'Deserve Mobile';

UPDATE portfolio_projects SET
  situation = $$I was tasked with the opportunity to redefine and enhance the company's product design and development process, focusing on a human-centric approach across more than 20 products.$$,
  task      = $$My goals included creating a unified design library, establishing a data visualization workflow, improving situational awareness design, integrating customer feedback, and leading national journey mapping across field workers and the executive team.$$,
  action    = $$I built a design ops process connecting the design library with development components. Designed Data Visualization Workflows to make complex data actionable. Enhanced Situational Awareness Design for mobile and mission control rooms. Developed solutions including a Damage Assessment app built in 48 hours during Hurricane Harvey.$$,
  result    = $$Successfully delivered several key products: Damage Assessment mobile app, Resource Manager, Utility 360 for asset discovery, and a Control Room application. The company was eventually sold to ARGOS, with the user interface cited as a key reason for the acquisition.$$
WHERE title = 'Treverity — Founding Design Partner';

UPDATE portfolio_projects SET
  situation = $$Design and development teams at Treverity worked from disconnected component libraries, creating inconsistency across 20+ products and slowing handoff.$$,
  task      = $$Build a unified design library connecting Figma components to production code, covering web and mobile surfaces, and establishing shared design tokens.$$,
  action    = $$Conducted needs assessment with designers and developers, established a design token architecture, built a component library in Figma with documented usage guidelines, and linked tokens directly to the development codebase.$$,
  result    = $$Reduced handoff time by roughly 50%. Standardized accessibility practices across all products. Components adopted by the full engineering team within one quarter.$$
WHERE title = 'Treverity Design Library';

UPDATE portfolio_projects SET
  situation = $$Operators at Treverity needed to build and compare KPIs but were blocked waiting on analysts to write SQL queries and generate reports.$$,
  task      = $$Design a self-service KPI builder that let non-technical operators compose, compare, and share key metrics without developer dependency.$$,
  action    = $$Mapped operator mental models through research sessions, designed a visual canvas-based interface for KPI composition, and prototyped and tested drag-and-drop workflows with actual operators.$$,
  result    = $$Operators gained self-service access to KPI creation, eliminating the analyst bottleneck for routine metric work and reducing report turnaround from days to minutes.$$
WHERE title = 'Treverity KPI Builder';

UPDATE portfolio_projects SET
  situation = $$Treverity's products used inconsistent iconography sourced from multiple libraries, creating visual fragmentation — especially in field and control room contexts.$$,
  task      = $$Design a cohesive, purpose-built icon system for the utilities sector, readable at 16px in dense dashboards and expressive at 64px in onboarding contexts.$$,
  action    = $$Immersed in the utilities industry to understand domain-specific concepts, sketched and systematized over 400 icons across categories, and tested legibility at multiple sizes with field technicians.$$,
  result    = $$A 400+ icon system adopted across all Treverity products, with consistent grid, weight, and optical sizing. Eliminated third-party icon dependencies entirely.$$
WHERE title = 'Treverity Icon Archive';

UPDATE portfolio_projects SET
  situation = $$Home Service Plus, a leading provider in home electric support and heating subscription services, faced a critical challenge: services were receiving increasingly poor customer reviews threatening reputation and loyalty.$$,
  task      = $$Lead a Service Design project to overhaul electric support and home heating subscription services — enhancing service quality, improving customer satisfaction, and streamlining internal processes.$$,
  action    = $$Conducted stakeholder workshops, shadowed service technicians and call center specialists, developed customer journey maps, facilitated ideation sessions with cross-functional teams, and rolled out redesigned services with comprehensive training.$$,
  result    = $$Customer satisfaction scores improved by 40% within six months. Service reliability issues reduced by 60%. Employee morale improved 30% in internal surveys. The project set a new standard for service design across the company.$$
WHERE title = 'Home Service Plus';

UPDATE portfolio_projects SET
  situation = $$Acumen faced challenges in effectively communicating its product evolution to customers, leading to dissatisfaction and difficulty building consensus among diverse product influencers.$$,
  task      = $$Enhance communication around product developments, updates, and educational content to improve customer satisfaction and build consensus among product stakeholders.$$,
  action    = $$Developed an enriched web experience featuring a forum for user engagement, training videos produced with Solution Engineers, and a dynamic content strategy keeping users informed of planned upgrades.$$,
  result    = $$Customer satisfaction soared by over 22%. The platform played a crucial role in fostering consensus among previously disparate product influencers, enhancing overall product coherence and community alignment.$$
WHERE title = 'Acumen Customer Website';

UPDATE portfolio_projects SET
  situation = $$I was recruited to overhaul the US Mint's online presence, transforming it from a flat thousand-page website with limited e-commerce into an engaging, conversational online experience that also served educational purposes.$$,
  task      = $$Revitalize the brand's online experience to facilitate e-commerce and effectively engage relevant audiences, while bridging knowledge gaps through a multi-year strategic plan aligning content creators, marketers, product owners, and audiences.$$,
  action    = $$Crafted a comprehensive narrative highlighting the brand's potential and current gaps. Employed audience research tools to identify target segments, assess social sentiment, and understand where potential customers sought information. Created data-backed personas to ground marketing in reality.$$,
  result    = $$A stunning 20% reduction in cart abandonment rates. Feedback from customers was overwhelmingly positive. The project underscored the value of a data-driven, audience-focused approach to digital marketing and e-commerce.$$
WHERE title = 'US Mint — Omnichannel Strategy';

UPDATE portfolio_projects SET
  situation = $$As a UX Strategist, I was tasked with improving navigational clarity on a platform that was failing to serve data-centered user intentions. Navigation was bifurcated between enterprise users post-authentication and consumers pre-login, neglecting Small and Medium Business Owners entirely.$$,
  task      = $$Lead development of a more intuitive navigation system catering to all user segments, bridging the gap between different user states and highlighting key paths for Small and Medium Business Owners.$$,
  action    = $$Collaborated with product owners, developers, content strategists, and users in an iterative redesign process. Engaged development teams early, incorporated real-time and qualitative data, and conducted ongoing user dialogues to identify pain points and test concepts.$$,
  result    = $$Dramatic improvement in customer satisfaction and a notable increase in cart completion rates. The Dell Strategy project became a benchmark for future UX strategy initiatives, demonstrating the value of cross-disciplinary collaboration.$$
WHERE title = 'Dell Technologies — UX Strategy';

UPDATE portfolio_projects SET
  situation = $$I collaborated with the owner of Real Sugar Soda, a local soda brand looking to establish market presence and distinguish itself among competitors.$$,
  task      = $$Develop a comprehensive identity package for the brand as a whole and for its 20+ unique soda flavors — visually appealing and distinct designs that would resonate with the target audience.$$,
  action    = $$Conducted market research on industry trends and consumer preferences, collaborated with the owner to define core brand values, then designed logo concepts, color schemes, and typography. Crafted unique designs for each of 20+ flavors while maintaining a cohesive look across the product line.$$,
  result    = $$The identity package significantly enhanced brand visibility and appeal. The distinctive flavor designs were well-received, contributing to increased brand recognition and customer engagement, and reinforcing Real Sugar Soda's position as a unique market choice.$$
WHERE title = 'Real Sugar Soda';

UPDATE portfolio_projects SET
  situation = $$At Broadlane and its healthcare clients, there was a critical need to develop a strategic roadmap for enhancing brand presence and user experience across established and new products.$$,
  task      = $$Lead creative efforts focused on a multi-channel branding approach, consistent UX methodology across digital platforms, and actionable design insights to elevate digital product offerings.$$,
  action    = $$Developed comprehensive style guides for consistent visual approach across print and interactive media. Led design and implementation of a consistent, accessible interface across SaaS applications and CMS portals. Advised internal communications leaders on visual standards and campaigns.$$,
  result    = $$Enhanced brand presence and user engagement across multiple platforms. Multi-channel branding and consistent UX methodology improved user satisfaction and established a strong cohesive brand identity, creating a solid foundation for future growth within Broadlane and its healthcare clients.$$
WHERE title = 'Broadlane';

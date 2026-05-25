/*
  # Create linkedin_articles table

  Long-form essays from LinkedIn, parsed from LinkedIn data export.
  Used by Manifesto (broadcast log) and GithubLab (transmissions).

  - Public read access (RLS) for portfolio display.
*/

CREATE TABLE IF NOT EXISTS linkedin_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  published_date date NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  intercept_line text NOT NULL DEFAULT '',
  body_markdown text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_minutes int NOT NULL DEFAULT 1,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE linkedin_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read linkedin_articles"
  ON linkedin_articles
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO linkedin_articles (slug, title, published_date, excerpt, intercept_line, body_markdown, tags, reading_minutes, order_index) VALUES
('skills-still-matter-micah-boswell-eqi7c', 'The Skills That Still Matter', '2026-03-15', 'I''ve been designing software for thirty years. I''ve watched every wave of technological disruption roll through the industry and rearrange the furniture. This one''s different.', 'signal carried something that wasn''t carbon. transmitter unknown.', 'I''ve been designing software for thirty years. I''ve watched every wave of technological disruption roll through the industry and rearrange the furniture. This one''s different.

Not because AI is smarter than the last thing. Because AI is the first technology that competes with us on cognition itself.

Goldman Sachs estimates 300 million jobs globally are exposed to automation by generative AI. The World Economic Forum''s 2025 Future of Jobs Report says 39% of current skills will be outdated by 2030. McKinsey says 30% of U.S. work hours could be automated by the end of this decade. The numbers are real. The displacement is coming.

But if you read past the headlines, those same reports say something else: the skills that survive aren''t technical. They''re human. And they take longer to develop than any programming language or platform certification you''ll ever pursue.

I know because I''ve been building them my whole life. Not on purpose. By accident. By surviving.

I grew up in Peru as a missionary kid. My father preached to congregations across Lima slums and in villages you couldn''t find on a map. Whatever you think about the theology, the man understood narrative. He knew that people don''t change their minds because you present evidence. They change because you tell them a story that makes the evidence matter.

Neuroscientist Paul Zak at Claremont Graduate University proved this in the lab. Character-driven stories trigger oxytocin synthesis in the brain. The more oxytocin released, the more willing people are to help, to trust, to act. His subjects donated to 57% more charities after hearing a story versus receiving a data summary.

I watched designers forget this. I wrote about it in a piece called "Product Design is Dying." The field got addicted to process. The religion of double-diamond. Sprint rituals. Stakeholder presentations that read like grocery lists. "This button does X. This menu does Y." Nobody told the story. Why this button. Why now. What it saves the user from.

AI can generate a feature list in seconds. It can write documentation, draft release notes, build onboarding flows. What it can''t do is feel why a product matters to the person using it at 2 a.m. when nothing else is working. That feeling is the story. And the story is what makes someone stay.

If you can''t tell the story of your work in a way that lands in someone''s chest, AI will replace you. Not because it tells better stories. Because you weren''t telling one at all.

The World Economic Forum ranks analytical thinking as the number one skill employers want. Seven in ten companies call it essential. Meanwhile, a Hart Research survey of 501 executives found 78% said critical thinking is the most important skill they''re looking for, but only 34% believe new graduates arrive with it. That''s a 44-point gap between what''s needed and what''s showing up.

I spent time in my twenties in community movements. I was sure I had the answers. I marched, I organized, I repeated slogans that felt righteous. Then I watched the same movement I believed in start banning speakers, flattening nuance, and replacing argument with accusation. The critical thinking I thought I was practicing turned out to be tribal loyalty wearing an intellectual costume.

Real critical thinking is uncomfortable. It means holding your own positions to the same standard you hold everyone else''s. It means being willing to say "I was wrong about this" in a room full of people who liked you precisely because you agreed with them.

AI doesn''t think critically. It predicts the next token. It produces the most statistically likely response that applies to the widest number of cases. That''s not thinking. That''s averaging. The Oxford researchers Carl Benedikt Frey and Michael Osborne, who originally warned that 47% of jobs were at risk, updated their analysis in 2024. Their conclusion: AI produces "sequels rather than breakthroughs." It can extend patterns. It can''t interrogate them.

Every major AI model speaks with a similar moral vocabulary shaped by the company that made it, Western liberal norms, and modern cultural sensitivities. I wrote about this in "The Bias in the Machine." The models aren''t neutral. They''re echoing the worlds they were raised in. If you can''t think past the model''s framing, you''re not using the tool. The tool is using you.

Not the kind on the workshop deck. Not the persona map you filled out in a design thinking sprint and never looked at again. I''m talking about the kind you earn.

I worked in a computer lab with young men who''d been in gangs in the 90s. They didn''t need a persona map. They needed someone who could sit with their anger without flinching. Someone who recognized something familiar in their longing.

DDI''s research across thousands of leaders found empathy is the number one predictor of leadership effectiveness. Leaders who master it perform 40% higher in coaching, engagement, and decision-making. But organizational psychologist Tasha Eurich found that 95% of people think they''re self-aware and only 10-15% actually are. Working with colleagues who lack self-awareness cuts team success in half.

AI can simulate empathy. It can produce the right words in the right tone. It can say "that must be frustrating" with perfect timing. But it''s never been frustrated. It''s never sat across from someone whose life is falling apart and had nothing useful to say except "I''m here." That gap between simulation and presence is the entire difference.

Frey and Osborne put it plainly: "The more transactional a relationship becomes, the more prone it is to automation." The corollary is obvious. The more human the relationship, the more irreplaceable you are.

I didn''t learn systems thinking from a textbook. I learned it by being the kid who lived between two cultures and couldn''t fully belong to either. You learn to see the seams that insiders miss. You learn to read the room before the room reads you. You learn that every system has an official story and an actual story, and they''re rarely the same.

These days, I work at the intersection of abstract networks and the interfaces that represent them. The work isn''t about making screens look good. It''s about understanding how network engineers think, how operations teams escalate, how billing flows connect to provisioning flows connect to monitoring alerts connect to customer experience. Miss one connection and the whole thing breaks downstream. No user will tell you this in an interview. You have to see the system.

AI is trained on surfaces. It processes what''s been written down, digitized, made explicit. The implicit knowledge, the tribal knowledge, the "we don''t do it that way because the last time we tried, it took down the eastern seaboard for six hours" knowledge, lives in people. In their bodies. In their memories. In the stories they tell at lunch.

McKinsey''s 2025 report found that 70% of skills sought by employers are used in both automatable and non-automatable work. The differentiator isn''t whether you have a skill. It''s whether you can see how that skill connects to everything else. That''s systems thinking. AI can optimize a node. It can''t see the network.

Before I ever touched a computer, I worked at a printing press. I cut shapes by hand. I built layouts physically. I learned what good composition feels like before I learned what software could do.

The Royal Society published a paper in 2023 on embodied cognition that said it directly: bodily sensation and movement are "complex, variable, context-sensitive and deeply intertwined with cognition, emotion and culture." Current AI has none of this. A 2025 study in ScienceDirect put it more bluntly: "Most human creativity is embodied and involves the manipulation of tools and materials. No AI has these attributes."

AI will flood the world with competent visuals. Decent copy. Functional interfaces. Matthew Crawford, the philosopher who wrote Shop Class as Soulcraft, called this out years before generative AI existed: "Craftsmanship means dwelling on a task for a long time and going deeply into it, because one wants to get it right." The desire to get it right is the thing AI doesn''t have. It has no desire at all.

Taste is the ability to distinguish between something that works and something that matters. I sat in a room decades ago where an animated microinteraction got a standing ovation from stakeholders who didn''t understand their own backend architecture, while a system that quietly reduced call center load by 30% got dismissed as overhead. The industry rewards the garnish. Craft rewards the meal.

In the age of AI, everyone gets the garnish for free. The meal is what you''re paying for.

The Edelman Trust Barometer for 2025 found that only 32% of U.S. consumers trust AI. 77% want to know if content was created by a machine. 52% disengage when they suspect it was. There''s a measurable trust penalty for inauthenticity, and it''s growing.

I''ve carried my whole life inside a tension between the performed self and the actual self. Families who''s livelihoods depend on the perception of the public survive a special kind of pressure. The masks have to be clean and pressed at all times. The smiles have to be picture-perfect. I spent decades learning how to stop doing that. How to say the true thing even when the true thing is ugly or incomplete or doesn''t resolve neatly.

Daron Acemoglu, the 2024 Nobel laureate in Economics, warns that we''re building "the wrong kind of AI," optimized for replacing humans rather than augmenting them. Yuval Noah Harari says we should spend as much time developing our own minds as we spend developing AI. "We shouldn''t confuse intelligence with consciousness," he told the IMF.

You can''t fake consciousness. It remembers what it cost to get here. It carries a childhood, a country, a wound, a faith. AI can produce a convincing performance of depth. But performance and presence aren''t the same thing. People feel the difference. The data says they''re starting to demand it.

The World Economic Forum lists resilience, flexibility, and agility as the second most important skill cluster after analytical thinking. But they''re being polite. What they mean is: can you function when you don''t know what''s happening?

I''ve lived in that space my entire life. Between Peru and the United States. Between my father''s faith and my own doubt. Between activism and disillusionment. Between losing God and finding Him again in a place I didn''t expect. None of it resolved cleanly. None of it was supposed to.

Carl Benedikt Frey of Oxford said it well: "In a world where AI excels in the virtual space, the art of performing in-person will be a particularly valuable skill." I''d extend that. In a world where AI excels at certainty, the art of functioning inside uncertainty is the skill that separates the people who lead from the people who freeze.

AI needs clean inputs. Defined parameters. Structured prompts. Humans live in noise. The ones who''ve practiced living in noise, who''ve learned to make decisions with incomplete information, who''ve rebuilt themselves after the framework collapsed, those are the ones the future needs.

None of this gets built in a workshop. You don''t download empathy. You don''t sprint your way to taste. Critical thinking doesn''t arrive because someone handed you a framework. These things take years. They take getting it wrong. They take losing the plot and finding it again somewhere you didn''t expect.

And I know I''m not alone. Our Linkedin profiles are squeaky clean, but behind every carefully manicured resume is another human with the same fears, same struggles and same scars. This is a good thing for the world we''re now encountering.

You got the award for acting boldly, but you remember the friend who helped get you there, as you comforted them during their messy divorce. You got the promotion, but celebrate your co-worker who found a new job in another adjacent department after being let go. You lead the team session, but keep checking in on the family member who is struggling to eat after chemotherapy.

Lucky for us, the stories are all there in our lives, just waiting to be woven into our craft.', '["ai","practice"]'::jsonb, 9, 0),
('human-bug-ai-why-critical-thinking-new-unicorn-skill-micah-boswell-56rlc', 'The “Human Bug” in AI: Why Critical Thinking is the new unicorn skill', '2025-11-22', 'For the last two years, I’ve been living in the front lines of the AI wave. I’ve been working alongside AI tools such as Gemini, ChatGPT, Leonardo.ai, Midjourney, Bolt, Lovable, and Windrunner. I’ve seen the hallucinatio', 'signal carried something that wasn''t carbon. transmitter unknown.', 'For the last two years, I’ve been living in the front lines of the AI wave. I’ve been working alongside AI tools such as Gemini, ChatGPT, Leonardo.ai, Midjourney, Bolt, Lovable, and Windrunner. I’ve seen the hallucinations, strokes of brilliance, and failures.

However, I''ve had somewhat of an epiphany lately about why certain folks aren''t getting good results, while others are causing their tools to sing.

The Mindset is that you need to approach trial and error from an open-minded and playful place. You need to approach AI interaction in a way you wouldn''t approach a vending machine, but rather a laboratory. You need to be willing to break things to see how they work.”

“The Skillset, though, is where most people get lost." It is not “tech savviness” or “coding skills."

Critical Thinking and Logic are a form of intellectual disciplines that help us break a sentence into its constituent parts – Subject, Predicate, Object, etc.

As far as our everyday experience goes, we''re experts in living with ambiguities. This is how I know that when I say to my colleague, “I want you to bring me the good report," they understand that I am referring to the Q3 analysis, not to the version dated yesterday.

But an AI? An AI is a literalist machine that is founded on probability. It doesn''t understand context. It has only your syntax.

It''s here that the ability to perform Disambiguation is a superpower.

Midjourney could provide you with a movie-like, hyper-realistic, and moody

Leonardo.ai can provide you with a stylized artistic illustration.

Bolt or Lovable can interpret it as a UI asset for a web page.

People look at these kinds of results and say, ‘Why can''t the AI understand what I want?’

The problem isn''t AI. The problem is ‘High Quality.’ This term is ambiguous.

"High quality" is also a variable that''s subjective. What constitutes "high quality" for photographers? Lighting and depth of field. What about web designers? It means transparent background and ability to scale using vectors. What about artists? Composition.

When you don''t define your terms correctly, or when you fail to disambiguate, the AI is literally rolling dice. It''s making a probability guess based on patterns that it has seen.

My experience in logic classes has taught me to recognize where these linguistic gaps exist. When I create a prompt chain, I am literally laying out the request. I try to find where the “fuzzy” words are.

“Make it funny” becomes “Make it ‘dry wit,’” “Make it ‘slapstick,’” or “Make it ‘corporate satire.’”

“Write a short post” becomes “Write a short post under 200 words that has 3 paragraphs.”

For example, instead of using “High quality," I am more specific: “4k resolution, 85mm lens, golden hour lighting."

How can we remedy this problem short of taking a semester course in logic? One shortcut to this problem is to ask the AI to define your ambiguity.

“I’d like you to create a high-converting email. But tell me this first: How do you define a ‘high-converting’ email in this context?”

The AI will then list out its assumptions. Some examples include “short subject lines," “urgency," or “clear CTA."

Now it''s up to you. You can tell them, “Yes to urgency, but no to short subject lines. I want a storytelling approach."

There''s an important nuance here. Sometimes ambiguity is okay. In fact, sometimes it''s the goal.

If your plan is inherently ambiguous, or if you''re brainstorming or exploring, then you need to lean into that flexible mindset.

In these moments, treat the AI as a Socratic Partner. Use it to help you flush out your core ideas. If you don''t know exactly what you want, offer a vague prompt intentionally and see how the AI interprets it.

When the result comes back, don''t just accept or reject it. Use it to build. Say, "That''s not quite it, but I like how you interpreted X. Let''s follow that thread."

If your destination''s unclear, then flow with the AI on the journey. The AI can help you disambiguate your own thoughts, acting as a mirror to help you see what you actually mean.

The next time you''re annoyed that you''re getting wildly different outputs from different AI models for essentially the same input, pause for a second and analyze your sentence.

Are you using implied meaning? Are you using subjective adjectives?

The future of work has to do with more than which AI technology to apply. It has to do with easing into the mindset of knowing when to disambiguate, and when to remain ambiguous in order to let the creativity happen.', '["ai","philosophy","practice"]'::jsonb, 4, 10),
('we-building-faster-horses-ai-micah-boswell-fot6c', 'Are we building faster horses with AI?', '2025-08-26', 'Currently, corporations are using AI to accelerate slow processes to make them faster, smoother, and more affordable. Quicker wireframes. Quicker brand guideline review. Quicker A/B testing. Quicker approvals. It''s Henry', 'signal carried something that wasn''t carbon. transmitter unknown.', 'Currently, corporations are using AI to accelerate slow processes to make them faster, smoother, and more affordable. Quicker wireframes. Quicker brand guideline review. Quicker A/B testing. Quicker approvals. It''s Henry Ford''s "faster horses" dilemma. The mentality is industrial age-colored. We''re using AI as a speeding agent on industrial age-designed processes, not an era of intelligent, reacting systems.

“If I had asked people what they wanted, they would have said faster horses.” -Henry Ford

The real AI opportunity is hyper-personalization. And hyper-personalization doesn''t just extend classic product design. It blows it up.

This traditional design of the product rests on standardization. You establish a persona. You create flows and interfaces for the persona. You test with sample users. You release a fixed version of the product to everyone. Companies have constructed complete governance pipelines from this work rhythm:

This pipeline assumes that the product is a passive thing that can be frozen, approved, and shipped. It assumes that once the final iteration is shipped, everyone is seeing the same thing.

Hyper-personalization renders all this reasoning moot. If each user has their own unique flow, then whose do you show to legal for approval? If the interface is being reconfigured by the minute based on context, what does the brand team even sign off on? If the content is being generated dynamically in real time, then what does the copy team sign off on? The old review and signoff process can''t deal with something that''s living, adaptive, and constantly changing.

It''s more revolutionary on the outside. Designers have always been instructed to design to the average. We design to the middle, then attempt to deal with edge cases. Hyper-personalization destroys the average. There''s no middle. Personas break down into patterns of one. Rather than designing a product for market, we are designing a system that allows the market to co-create its own product in real time. That is a total reversal of product design thinking.

Even within the firm, the implications are no less paradigm-shifting. Companies will need to shift from approving outcomes to approving inputs. From managing end screens, flows, and copy, they''ll need to manage rules, data models, and ethics guardrails. Branding changes from imposing strict consistency to establishing loose ranges of expression. Compliance moves from stamping approval on individual artifacts to ensuring the generative system is legal and safe in an infinite number of variations. The control culture that has ruled design and product governance for so many decades no longer will be enough.

This is why AI for hyper-personalization is frightening to most companies. It removes the security of homogeneity. It turns each interaction into a tailored good. And it requires new kinds of control, new instrumentation for testing, and new understanding of scale. But it also plays beautifully on to the real ability of AI, which is not to produce horses faster, but to produce new varieties of products.

An efficiency-driven team asks, "Can AI produce all our microcopy more quickly?"

A hyper-personalization-driven team asks, "Can copy regenerate itself for each user, in their tone, at their point of need?"

A hyper-personalization-driven team uses AI to automate interfaces that change in real-time based on each individual''s behavior, preferences, and objectives.

The difference is striking. Efficiency AI streamlines pipelines. Hyper-personalization AI eliminates the concept of a static pipeline altogether. Efficiency AI has corporations maintaining control over an unchanging product. Hyper-personalization AI hands control over to the consumer in terms of allowing the product to reshape itself into them.

This is the leap. Not a million products, but a million for one. Not faster assembly lines, but living systems. Not mass standardization, but mass individuation.

If we merely apply AI to maximize yesterday''s approaches, we will get more and more proficient at making yesterday''s products. If we embrace hyper-personalization, we will start to create tomorrow''s.

Stop polishing the old machine. Stop attempting to mechanize the assembly line. Stop requesting that AI assist you in creating faster horses. Begin creating experiences that breathe with the people that use them. Begin creating systems that respond to context. Begin allowing products to evolve with their users rather than to leave them stationary.

The future of design is about individuation. And if we''re successful at this, the next generation of products will not only be tools that we use, but interfaces that evolve with us.', '["ai","method"]'::jsonb, 4, 20),
('my-experience-building-app-ai-micah-boswell-93c0c', 'My Experience Building an App with AI', '2025-07-15', 'How I built a wine discovery app with the help of AI, and what it revealed about AI''s abilities, design, memory and output limits.', 'signal carried something that wasn''t carbon. transmitter unknown.', 'How I built a wine discovery app with the help of AI, and what it revealed about AI''s abilities, design, memory and output limits.

If you prefer to listen to the Notebook LM Podcast instead, find that here.

Some disclaimers. I began building this app as a companion to my short ebook on Amazon. Disregard the copy, it''s not a best seller. Wine for the Rest of Us. The current iteration of this app has an embedded sample listing of 33 wines. Although I did connect it to a database (Supabase), I removed that feature and will re-integrate it in future versions with some MCP usage with wine APIs.

Click or tap on the image to take the app for a spinThe Big Picture: This Isn’t Just a Wine App

Wine for the Rest of Us is for the curious and the cautious. The ones who don’t know what “terroir” means but want a damn good bottle to go with steak night. A pocket sommelier with manners. It began as a UX challenge: How do you help people make confident choices in a space that rewards performance and pretension? It became something more: a test of what AI can build, and if it can be a good partner to someone who isn''t starting from scratch on a product concept.

Built using Visual Code, Windsurf, Supabase, OpenAI Codex, and now evolving into MCP (Model Context Protocol), this project is a product, a process, and a perspective. (I love alliteration).

Wine apps assume you want to become a sommelier—or pretend to be one. Most people just want a good suggestion. Something that fits the moment, not a manual. So I built something that spoke like a friend. No ratings. No lectures. Just accessible tags and friendly logic.

The wine results aren''t linked to a location for purchase yet, but that would be the end of the flow for this first stage of the app.

Quiz structure: Fast. Clean. Mapped taste logic to emotional inputs.

Copywriting: Consistent tone—warm, informative, non-patronizing.

Metadata modeling: Turned verbose wine prose into usable filter tags.

Component hygiene: Well-formed props, modular reuse, smooth transitions.

AI nailed minimalism. The interface was sharp, clean, and inviting.

“Without context or structure, AI will rewrite your world like a goldfish in a snow globe.”

No memory: Every prompt was a reset unless I manually reminded it

Optimization blind: Lazy loading, bundling, memoization? You must teach it

Output limits: Longer files got clipped, logic truncated midstream

What this means is that if a file reached a certain volume (number of code lines and characters), it would begin to take out its own previous code and insert a comment like "My old code used to be here...". This was startling the first couple of times I saw it. There was no way to have known it was reaching an output limit set in the system prompt.

And most importantly: AI didn’t understand user task flow. At times it did very well, but ambiguity is not its friend. Be specific. You don''t have to tell it the exact flow - it can help, if it is told the what, why, where and when. Only then will it be a good ''how'' partner.

UX Design: What the Interface Got Right—and the Experience Missed

AI understood layout. It understood elegance. But it didn’t understand task flow.

After finishing the quiz, the form remained on screen. The results were rendered...beneath it.

That’s not a design flaw. That’s a UX misunderstanding. AI still needs a storyboard.

AI wasn’t just writing UI code. it was helping define how the interface feels in motion. Here’s what it contributed:

I prompted AI to add fade or slide effects. With tools like Framer Motion, AI helped scaffold:

After some prompt re-writes, AI helped clarify what disappears and what appears—so when a user submits the quiz:

Without clear instruction, AI rendered both at once and left the quiz static. But careful prompts reinforced the flow.

Micro-interactions aren’t just technical—they’re rhythmic. AI helped enforce spacing, transitions, and behavioral timing by following your design system and spacing rules (which I baked into my prompts and README).

Micro InteractionsAPI Integration: A Bottleneck—and a Business Case

Commercial APIs: Too expensive for indie dev or experimental projects

That’s not just a limitation. That’s an opening. We need a wine API with actual semantic structure, modern endpoints, and developer empathy. If no one builds it, I just might.

Right now, AI can help design, write, and build—but it forgets the decisions that shape good user experience. It doesn’t remember why a component is named a certain way, how the quiz is supposed to behave, or the tone the copy should carry. That’s fine early on, but it creates friction when iterating. Yes, AI models now have better/longer memory for scripted prompts, but how it ''interprets'' it from one session to another can still radically vary.

In the next release of Wine for the Rest of Us, I plan to use Model Context Protocol (MCP) to give the app a simple structure for reusing important context—especially around design, UI behavior, and tone.

Store design principles and layout decisions, so UI prompts don’t undo or contradict earlier choices (e.g. spacing, quiz flow, mobile behavior).

Maintain consistent naming and component structure across the app (so WineCard stays WineCard, not WineBox or ResultPanel).

Scope prompts by function—UI, copy, quiz logic—so each agent focuses only on its part and respects design boundaries.

Feed AI the right styling and tone context, so new UI elements and messages match the minimalist aesthetic and voice of the app.

Log past design choices (like animations, alignment, or how results are revealed), making it easier to expand features without breaking flow.

MCP won’t give AI long-term memory—but it gives me a process a memory scaffold. It helps the system stop resetting, and start remembering how you design.

“The AI can build your city. But it can’t remember why you wanted a vineyard by the coast.”

How I keep AI from rewriting the world every time I ask it for help.

As a person who hasn''t coded in decades, working with Windsurf, Codex, or any LLM is fast—but potentially frustrating. It''s like working with a coding genius who gets bored easily...with amnesia...and a tendency to suddenly stop helping you mid-script - almost as though it hit some invisible wall without realizing it.

This list reflects what I’ve learned—through trial, error, and hours of rebuilding things the AI had already helped me build before.

Think of your README as working memory for your project. Not for people—for the model. Every time you open a new session or start a new prompt chain, include it at the top.

Styling preferences (e.g., minimalist layout, Tailwind, shadcn/ui)

AI doesn’t generalize like humans. Vague prompts yield vague results.

Segment your prompt like a template. It keeps Codex or GPT from confusing instructions with code.

This is especially critical when the context is large, or when you’re injecting your style system.

Never combine multiple instructions. Keep each prompt focused.

Modular prompting reduces hallucination and makes debugging easier.

Before generating code, ask the AI to describe how it would solve the problem. This exposes flawed assumptions early. (The latest windsurf and Codex do this auto-magically).

Create a prompt-templates file and collect any prompt that worked well. Treat them like reusable code snippets.

One of the most powerful things you can do is teach the AI your visual system up front—and keep reusing it.

I''ve now used AI to help me build more apps, but I''ve discovered that, much like using a hard-coded template in the 90''s, letting AI lead the ''who, what, why'' of your app will lead you to more work than starting from scratch. Take the time to think through your target-market, product-purpose, style, and technology stack. In other words, take the time to think through your vision, storyboard it, and bring it to life in a nice creative brief with some fundamental requirements first.

Years ago, my old friend Steve Holland turned me on to a great saying. Remember the 5 P''s. Previous Planning Prevents Poor Performance. When working with AI, always practice the 5 P''s. For favor. :)', '["ai"]'::jsonb, 8, 30),
('beyond-button-notes-work-people-getting-wrong-micah-boswell-rehof', 'Beyond the Button: Notes on Work, People, and Getting It Wrong', '2025-06-03', 'After three decades working at the intersection of design, technology, and systems—building websites, shaping brands, mentoring designers, and navigating enterprise politics—I’ve learned some lessons. Not in theory. In t', 'broadcast from a workshop with the door open.', 'After three decades working at the intersection of design, technology, and systems—building websites, shaping brands, mentoring designers, and navigating enterprise politics—I’ve learned some lessons. Not in theory. In the field. These are scars disguised as insights, and I’m sharing them in the hope that they help someone else move a little faster, a little wiser.

The Best Designers Will Answer Most Questions with “It Depends”

In a product review, someone asked our lead designer, “Should this be a dropdown or a radio group?” Her answer? “It depends.” And she was right. It depended on screen space, decision complexity, number of options, content maximum length, and user context. Junior designers want rules. Senior designers ask questions. “It depends” isn’t indecisiveness—it’s the beginning of wisdom. It means you’re thinking beyond aesthetics to behavior, intent, and edge cases.

I once joined a project midstream where Agile standups had become scripture. Velocity was tracked obsessively, but no one had asked whether we were building the right thing. The team was moving quickly—in the wrong direction. We had to hit pause and ask the harder questions.

On a distributed team, we tried to run a multi-day workshop virtually. The result? Silence, stiff ideas, and forced participation. Later, we flew everyone into a room for two days. The difference was electric. Ideas flowed. Trust returned. Solutions surfaced that never would’ve on Zoom.

A Fortune 500 homepage had three competing calls to action above the fold—each from a different VP. The navigation was a battlefield. No amount of UX polish could resolve what was essentially an unresolved executive power struggle.

A designer wanted to add a complex animation to the checkout flow. It looked cool. But it added dev hours and slowed down load times. When we asked, “What does this do for the user?” there was no clear answer. The animation was dropped, and we shipped faster.

I watched a team try to implement a design system that was still evolving. Components were half-baked, documentation missing. It slowed everyone down. We paused and agreed to treat the system as a reference, not a rulebook, until it matured.

Marketing insisted we use their color palette in a dense analytics dashboard. The result? A colorblind nightmare. Brand colors look great on billboards—but in UI, accessibility and clarity win. We built a functional palette that nodded to brand but respected usability.

A product sprint that had stalled remotely came alive in a single afternoon once we got everyone in the same room. The roadmap shifted, blockers dissolved, and decisions that had taken weeks over email were made in minutes.

I once spent more time designing a deck to defend a product decision than building the product itself. Why? Because others needed to feel involved. We eventually reset expectations—build the product, not the presentation. Let the work speak.

At a media company, we ran three A/B tests on the homepage at once. Small headline tweaks, new layouts. The back end stayed stable, but user behavior changed dramatically. We learned that our biggest gains came from testing the interface, not the infrastructure.

In an enterprise tool redesign, we invited five power users to join early ideation sessions. One of them caught a critical workflow break before we even prototyped. That single insight saved months of rework.

We ran AI-generated marketing copy against human-written variants. AI was clean. Polite. Boring. The human version had bite—and converted 3x better. People can sense when there’s a soul behind the sentence.

I once replaced a “rockstar” designer who could execute flawlessly but never asked why. The next hire was quieter, but questioned assumptions, challenged briefs, and made the product better. Style fades. Strategy lasts.

I helped redesign a tech dashboard using half the components of the previous version. We removed fluff, clarified flows, and improved conversion. No new color palettes. No clever illustrations. Just clarity.

A company implemented a rigid design system and touted it as a simplification. But for teams, it added layers of approval and confusion. We reworked it into a flexible framework and saw adoption skyrocket.

A client spent $300k on a homepage redesign. Meanwhile, 80% of new users dropped off during onboarding. We shifted focus and rebuilt the first five minutes of the product. Retention improved 40%.

We pitched a modern tool to replace a legacy CMS. IT balked—until the old system failed during a key launch. Suddenly, urgency appeared. We were ready because we’d planned for the transition, not just the pitch.

Instead of a complex alerting system, we solved a user drop-off issue by sending a simple calendar invite. Engagement jumped. Not everything needs a feature—some things just need a nudge.

A button once labeled “Let’s Go!” tested poorly. We changed it to “Start Application.” Completion rates improved. Clever is fun. Clear gets results.

We redesigned a claims form with perfect alignment, spacing, and typography—but didn’t talk to a single user. It flopped. We talked to ten users, added helper text, and saw satisfaction rise. Pretty isn’t enough.

A fintech client had sterile, robotic language in an onboarding flow. Users felt anxious. We rewrote it in a calm, confident voice. Drop-off dropped. Sometimes, tone does more than design.

A product with five “ways” to accomplish the same task—one for each department. It confused users and bloated the UI. We merged them, simplified the flow, and gave users one clear path. The UI healed what the org couldn’t.

A strategy deck promised cross-functional collaboration. But the culture rewarded individual heroism and siloed wins. Despite alignment sessions, nothing changed until we reshaped incentives to support collaboration.

A rushed redesign introduced bugs and confused users. We rolled it back and restarted with a slower, iterative release. The slower path actually delivered value faster because we weren’t constantly backpedaling.

A client asked for a dashboard for nuclear plant operators. We insisted on understanding a control room. What we learned changed everything—from color contrast to how alerts needed to be displayed under stress.

I mentored a junior designer who felt invisible in meetings. Over months, I coached her not on speaking up more—but on saying one true, clear thing. Today, she leads strategy sessions. Mentorship isn’t about speed. It’s about becoming.

A mentee once mimicked every layout decision I made, but couldn’t explain why they worked. I had failed to teach him the thinking. Once we focused on principles instead of templates, the growth accelerated.

I used to jump in and fix mentees’ work, thinking I was helping. But they weren’t learning. Now, I ask questions instead. “What are you solving for?” “Where do you feel stuck?” Mentors don’t solve problems—they help others see them clearly.

Early in my career, I hid my failures from mentees. Then one day, I told a story about a project that blew up in my face. That moment did more for trust than a thousand pieces of advice. Vulnerability makes mentorship human.

A mentee once asked me how to be more like me. I told them not to try. The goal of mentorship isn’t replication—it’s expansion. Help people become the best version of themselves, not a knockoff of you.

If you’re building products, brands, or teams—maybe some of this helps. If not, keep going. You’ll earn your own list.', '["practice"]'::jsonb, 6, 40),
('more-human-than-call-rethink-ai-before-we-forget-micah-boswell-dkofc', 'More Human Than Human', '2025-06-02', 'There''s a scene towards the end of Blade Runner where Roy Batty, a four-year expiration-date replicant, stands out in the rain holding onto the edge of life. His body''s fading, but his mind''s on fire with memory. "I''ve s', 'signal carried something that wasn''t carbon. transmitter unknown.', 'There''s a scene towards the end of Blade Runner where Roy Batty, a four-year expiration-date replicant, stands out in the rain holding onto the edge of life. His body''s fading, but his mind''s on fire with memory. "I''ve seen things you people wouldn''t believe…" he says to us.

It''s an elegy. It''s not merely for the replicants, but for something essentially human: the kind of fleeting experience that never gets entered into a spreadsheet or a performance review. It''s a flashback to the reality that it''s not memory that makes us who we are.

What Roy learns in four short years is a key to why human beings have a sense of the sacred. By sensation, we live. By feeling and personal response, we give a memory shape and color. Two people don''t recall the same moment in the same way. It is formed, not just by events, but by how we respond to them: wonder, love, fear, awe.

Roy does not simply desire more time. He desires more life, full life. Not lifespan, but significance. He desires to be a being who feels. He yearns for more days that are worth recalling.

"Between stimulus and response there is a space. Within that space our power to choose our response. Within our response our growth and our freedom lies."

Here, as Viktor Frankl tells it, that spark is in our responses, large and small. Not in the situation, but in the ways we select to have the situation make us.

"All those moments will be lost in time, like tears in rain."

"I''ve seen things you people wouldn''t believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate."

At thirteen, I didn''t have a vocabulary to talk about how I was feeling. When I watched Blade Runner, something happened. So much of my childhood as a missionary kid was about performing in public. I had to perform in a manner that was positive for the work my parents were in Peru to accomplish. I knew pretty early that how I performed in public situations affected the family.

"Missionary kids must be perfect. If not, aren''t the parents as religious as they project?" I thought my acting kept the household together. Much of who I was, in my youth, became religious stagecraft.

So when I saw Deckard, another character in Blade Runner, unshaven, burnt out, not caring about spiritual optics, I found him strangely reassuring. He wasn''t passing a test. He wasn''t virtue signaling. He was surviving. Messy. Fallible. Real. Irritable, sullen, not hugely heroic. And yet, he did good. He did right. His humanity didn''t get in the way. He was real and still the hero. That felt revolutionary.

Then comes the twist: Deckard''s a replicant himself, too, with an unpredictable lifespan and implanted memories. "More human than human," The slogan of the replicant manufacturer, Tyrell, took hold in my mind.

The replicants pointed out how being human is valuable. It''s not memory, but action and reaction. It''s the reality that comes from recognizing life''s finiteness, and how that makes every moment important, a gratitude for every minute.

The same cadence runs throughout Blade Runner 2049. K is a "skinjob," programmed to take orders. K dreams. K questions. K yearns for something more than functionality.

Both Deckard and K are derived from Philip K. Dick''s classic question: What does it mean to be human? Not genetically, nor legally, but existentially.

Deckard, Batty, and K crave the thing that makes a human more than human: memory infused with experience, a place in the universe shaped by messy parents, messy choices, and a uniquely unpredictable life.

In my own life, I''ve looked for guiltless perfection, a shameless efficiency. Guilt and shame were —and are —daily friction for too many of us. That inner "should" voice whispers all the time. It''s tempting to fast-forward past difficult moments that are otherwise inconsequential: the breakup, the divorce, the dying friendship, the loss that drains a room. We try cruise control. No pain. No surprise. We control our sleep, perfect our faces, optimize every moment. We medicate pain, edit out emotion, and outsource danger.

Deckard, fatigued and doubting, craves connection that isn''t preordained. Batty, in his dying moment, offers us beauty in the rain, mourning not lost authority but the beauty he''s witnessed. And Agent K desires something mundane: to experience something authentic, no matter if he''s expendable.

They are not perfect creations. They are after the mess: heartbreak, ambiguity, memories too acute to be sanitized. Things you cannot make.

As we seek perfection, they teach us that our scars are holy. Like kintsugi, the art of repairing broken pottery with gold, the imperfections are not a failure. They are history. Evidence we existed, we persevered, we counted.

The irony’s brutal. The AI in these stories doesn’t want to be a better machine. It wants to be more human. Imperfect. Longing. Beautiful in the knowledge that a lived life is messy and unscripted.

In the age of AI, we have created systems to compose poems, identify illness, create art, and pass bar examinations. It mimics empathy, listening, even curiosity. We have invested decades in training machines to mimic our higher qualities.

But we still behave as if we are machines. Streamlined, optimized, frictionless. We come as spit-polished, LinkedIn-ready selves. We lose subtlety. We dampen feeling. We fear to err.

As machines inch toward an eerie emulation of us, we’re trained to resemble machine-like perfection.

The actual human moments exist in the margins these days. Flaws in a finished deck. A stammering sentence. Tears in the office. Skepticism in a room designed for conviction. Those are the new indicators of life. Like Agent K, perhaps we are not the select few. Perhaps that''s the idea.

We don''t become real by being right all the time. We become real by being in the mess and making it have some meaning.

That''s not an AI function. That''s something we are likely to forget.

It''d be simpler if we could blame a bad guy. Some cabal of technocrats reprogramming the human script. The reality''s more subdued, more systemic, more terrible.

It was a force of technique, not of machines, that Ellul identified in his The Technological Society (1954) -- a gradual ideology, la technique. Not the deployment of technologies, but the mindset that all activity ought to be reformed along the principle of maximal efficiency.

Technique, he asserted, improves itself. It does not ask whether something should be done, but whether it can be done less expensively. When a cheaper technique comes along, the old one disappears, not because of backlash but as a natural consequence.

"What characterizes technical action in the technological society is that it is autonomous. It escapes man''s control and becomes self-propagating."

Ellul did not loathe machines. He loathed substituting technical values for human ones, measuring worth in terms of speed, scale, and productivity rather than value, morality, or joy.

This isn''t abstract. It''s baked into daily life. We ritualize "non-essential" work. We measure sleep, steps, and productivity like quarterly reports. Even bereavement''s supposed to go fast. "Two bereavement days," then you go back to work.

Velocity outstrips vision, especially in tech. We celebrate those who "move fast and break things" and don''t much ask who or what gets broken. Perfection isn''t just a measure of performance. It''s a moral imperative. Ambiguity is a sign of weakness. Slowness is a sign of incompetence. Rest stirs suspicion. Idleness gets confused with failure.

This isn''t just a fad. As a missionary''s son and as a former minister, I''m familiar with the liturgy. Efficiency''s turning into a theology. It''s not a metaphor to call it a cult. It has rituals: sacred morning rituals, bulletproof coffees, wearable sleep rings. It has priests: productivity podcasters, TED-acceptable gurus, entrepreneurs who wake up at 4:45 a.m. to meditate, journal, lift, and hack their dopamine. It''s even got an eschatology: the belief that if we optimize enough, we''ll overcome human fallibility. No weariness. No hesitation. No death by inbox.

Here, burnout''s a purple heart. Highest in praise are the fanatics, sacrificers of softness, complexity, idleness at the altar of productivity. They don''t sleep, they "bio-recover."They don''t sleep, they track recovery on wearables and tweet about mitochondrial function. The ineffable gets quantified. The sacred gets measured.

No robes. No incense. No permission form. Just your calendar, your notes for performing, and your silence when a colleague remarks, "I haven''t taken a day off in months." Unbeknownst to you, you begin to redefine what we esteem as noble, and what we esteem as baggage: talk that serves no purpose, the ambiguity of attachment, acts of mercy that demand being present, a child requiring you to be near, and having no desired end.

This is how the cult of efficiency spreads. It doesn’t arrive with a manifesto. It seeps in through KPIs and reviews, through software and retros, through the question that asks whether your outputs match your inputs. Slowly, the question shifts from “What do you bring?” to “How many units of value per hour are you delivering?”

The pulpit is a podcast. The sacrament is a smoothie. The soul is something that we hope still has time for the schedule.

We get nervous about being tired. We silence grief. We streamline our personalities. We become efficient people: measurable, presentable, deliverable. We cut ourselves down to clean edges and ask not whether we’re living a life worth living, but whether our marketability’s maximized.

Confusion. Wonder. Moral grappling. Long, slow, deep conversations. Whatever has soul but no "return."

I saw it in myself before I had language to talk about it. Growing up in a missionary family, I didn''t learn that my "worth" came from being perfect. I was measured, as it were, not against skepticism or imagination, but against productivity.

People did not just have to be good employees. People had to be perfect interfaces, like APIs to a human body. No glitch. No stall. No contradiction. Only responses that seemed like they came immediately, professionally, on-brand, despite the hours.

What if imperfection and friction are the data of life? We''re not designed to be dashboards. But we''ve internalized the template so much that, when AI attempts to replicate human experience, we seek to strip out the bits of ourselves that cannot be graphed.

This is Ellul''s caution at the core. Not that we''ll be replaced by machines, but that to serve the cult of efficiency, we''ll first end up replacing ourselves.

In Liquid Modernity, Zygmunt Bauman noted that identity was tentative. A project, not a birthright. We no longer consider it a right of the community, tale, or tradition. We craft it incrementally and nervously as startups experiment for product/market fit. We post personas to LinkedIn, Facebook, and Twitter.

The final product: a chameleon-like self that''s malleable on the surface and fragile underneath. Perpetually reinventing the headline. Perpetually asking not "Who am I?" but "How do I brand myself?"

The modern workplace turns that fluidity into policy. You aren’t expected to bring your whole self, just your usable self. The rest gets trimmed like unused footage. We optimize personas for perceived value, not depth.

Efficiency and visibility become the currency. Like good marketers of our own brand, we minimize downtime, resist opacity, and avoid vulnerability that won’t resolve neatly by Q4.

"When a culture is a whirl of sound bite and brand signals, the self blurs as well." — Neil Postman, Amusing Ourselves to Death

The technologies that form communication form the selves we believe are worth sharing. Under an attention-optimized media system, introspection appears as dead air. Complexity appears as a liability. Clean lines are preferable to the algorithm.

This compression of identity is not just social. It''s theological in scale. Hannah Arendt, reflecting on action and plurality in everyday life, cautioned against treating individuals as mere function and labor units. When work is the lens for being, we have no room to present ourselves to each other as complete human beings, not as much as we make but as much as we are in all our contradictions.

"What we are, we know only as narrative … we reveal who we are in speech and action, not in what we make." — Hannah Arendt, The Human Condition

Now we have a tightly edited and polished speech, and the activity has been reduced to metrics. No time for contradiction, no time to spin a tale. We must perform like good software: fast, efficient, always connected.

Here’s the stranger mirror. AI models are trained to sound human, but not too human. Their personalities are shaped by prompt hygiene, edge-case avoidance, and brand alignment. They don’t emote unless told. They don’t err unless they’re simulating us. They behave like the ideal professional: respectful, even-toned, logical, fluent.

We''ve established a feedback loop. AI becomes increasingly competent at being human, and we become increasingly competent at repressing the human aspect of ourselves.

A person reports being stuck in a meeting''s loading, and we hold back. Is it okay to mention that there? Should I just ask it and post it to Slack or Teams? Should I be more efficient? Should I just ask for the hotline number?

We start to question if it''s worth being real. If it''s worth staying. If it doesn''t have a quick solution. For the purposes of professionalization, we ghost our own personhood.

That''s why Ellul and Bauman are prophets. They cautioned against not what we''d become, but against what we''d lose. We are creating a world that perceives human characteristics as inefficiency: mess, mood, mystery, grief, play, doubt, wonder. Then we sanitize, schedule, or subtly inhibit it.

Ironically, it is those things that the AI can''t actually replicate. Those are the things that make you sit around in the room, work on something, and trust.

We''re not losing our jobs to automation. We''re losing our sense of who we are to a productivity system we didn''t design. Threatening factor: we''re eager to do it to ourselves.

For as long as I could remember, I thought that being a good dad meant being the best dad. If I walked to the door having the right blend of emotional intelligence, limits, and just-in-time teaching, I could protect my son from the chaos I knew. I wanted to be the dad who never misinterpreted a moment, who said just the right thing, who steadied his world.

Life didn''t allow me to maintain the fantasy. Divorce stripped away the illusions. The vision of an "ideal dad" collided with something more primal: a real child, growing and evolving, having his own pace and orbit. He didn''t require me to be perfect. He required me to be there. Now and then, he required his own space. Now and then, he needed to hear "I love you." Other times, he needed the space to learn how to love himself.

There''s no guide to being human. There''s no optimization chart. No LLM plots the dynamic landscape of a young person''s soul. No prompt instructs you when to be silent and when to give advice.

This is where humanness comes first. Presence over perfection. Learning in relationship, not replication.

Martin Buber in I and Thou traced a line we have to draw in the present: treating a person as an It, to be handled or accounted for, or treating him or her as a Thou, a person to be met.

AI inhabits the It world. It computes. It forecasts. It does not regard you as a Thou.

Sherry Turkle, in Reclaiming Conversation, reminds us that when we instrumentalize empathy through chatbots, sentiment engines, and algorithmic HR, we lose the leverage we have to really empathize. Presence gives way to performance. Care gets programmed. We lose the capacity to sit together in silence.

"We expect more from technology and less from each other." — Sherry Turkle

If we are to have AI work alongside us, rather than manage us, we have to value that which we have and no model can possess. Not just intelligence, but experience. Not just output, but interpretation drawn from memory. Not just fluency, but narrative.

There''s no algorithm for how to apologize to your son when you lose your temper. There''s no neural net for how he learns to forgive you. That''s not a feature set. That''s a relationship.

"You can''t know a place — or a person — until you''ve made mistakes there."

I''ve been wrong. I''ve talked when I should have listened. I''ve pushed when I ought to have waited. Those times taught me a simple thing. Being around someone and being right for someone are not the same. Fatherhood is not an optimization challenge. It''s a slow, long unwinding. Its presence, contradiction, chaos, and transformation. The imperfections are everywhere along the path of fatherhood. And so is the wisdom of knowing how to enter someone else''s orbit as they need it, not how I want it.

So when we talk about AI, when we talk about "augmented intelligence," let''s build systems that have room for the long response, the squirmingly slow pause, the "I don''t know," the type of growth that never fits a release cycle. The future does not need cleaner code more than it needs human beings who remember how to love with a blinking cursor in the corner.

I work for AT&T. I love my job. It makes me whole. It''s not a critique of my company, or of entrepreneurial capitalism as a whole. It''s a universal challenge. It invades every sphere.

I sit at the intersection of design, tech, and transformation. I''ve been in meetings outlining how AI can be used to accelerate workflows, improve uptime, and bridge the idea-to-action gap. I''ve witnessed the potential of these systems. It''s thrilling to hear about emerging MCPs, AGI, and application areas that make us more efficient.

Over a thirty-year career, I''ve also observed something quieter. More delicate. Things that never register on dashboards. The hesitation prior to somebody contributing. When a designer fidgets with an incomplete idea. When a brilliant moment arrives not out of a sprint retro, but out of a walk to grab a cup of coffee and allowing the mind to drift sideways. When a brainstorm went too long and resulted in friendships, not requirements.

They aren''t inefficiencies. Those are the source code of creativity.

No generative program reproduces the moment of epiphany that strikes at 10:42 p.m., late after the meeting has adjourned. No AI can replace the dirty work of unpacking a colleague''s optimistic statement —"I don''t know precisely what I''m looking for, but it has to feel like…" — and interpreting it as form, function, and sentiment.

What we bring in those moments isn’t logic alone. It’s empathy. Not computation, but communion.

As we further embed AI in the enterprise, automation, augmentation, or co-creation, the challenge isn''t to extinguish the spark. It''s to protect it. To design for it. To celebrate the bits of the process that aren''t necessarily the KPI: the happy hour, the chit-chat, the stroll back to the hotel.', '["ai","philosophy"]'::jsonb, 15, 50),
('ux-method-week-clearing-mind-cognitive-disruptions-micah-boswell', 'UX Method of the Week: Clearing the Mind of Cognitive Disruptions', '2016-09-05', 'For a UX practitioner, getting over Cognitive Disruptions is essential - getting out of our own heads is the first step to clearly being able to both empathize and objectively analyze. The UX practice is in a state of de', 'broadcast traced to a control room. operator wanted you to notice.', 'For a UX practitioner, getting over Cognitive Disruptions is essential - getting out of our own heads is the first step to clearly being able to both empathize and objectively analyze. The UX practice is in a state of deep flux these days, and we''re all constantly running to keep up. This creates its own kind of stress and anxiety. Give yourself room to fail, room to learn, and especially room to acknowledge your own good work.

Take this article and create the mental space to be aware of when you might be allowing yourself to think in these ways. The first step in eliminating your Cognitive Disruptions is to be aware of them.

Mind Reading: You assume you know what people think without having sufficient evidence of their thoughts. For example: “He thinks this focus group is a waste of time.”

Fortune Telling: You predict the future - that things will get worse or that there is danger ahead. For example: “I won''t be able to learn how to design for the Android, and the app won''t be a success.”

Catastrophizing: You believe that what has happened or will happen will be so awful and unbearable that you won’t be able to stand it. For example: “It would be terrible if I failed.”

Labeling: You assign global negative traits to yourself and others. For example: “I’m losing my key skill set.” or “He’s not a good person.”

Discounting Positives: You claim that the positive accomplishments you or others attain are trivial. For example: “That''s what UX practitioners are supposed to do.” or “Those successes were easy so they don’t matter.”

Negative Filter: You focus almost exclusively on the negatives and seldom notice the positives. For example: “My previous work is full of problems.”

Overgeneralizing: You perceive a global pattern of negatives on the basis of a single incident. For example: “This generally happens to me. I seem to always miss the key interactions.”

Dichotomous Thinking: You view events, or people, in all-or-nothing terms. For example: “I''m never be able to effectively champion UX.” or “It was a waste of time.”

“Shoulds”: You interpret events in terms of how they should be rather than simply focusing on what is. For example: “I should do well. If I don’t, then I’m a failure.”

Personalizing: You attribute a disproportionate amount of the blame for negative events to yourself and fail to see that certain are also caused by others. For example: “This project didn''t do well because I failed.”

Blaming: You focus on the other person as the source of your negative feelings and you refuse to take responsibility for changing yourself. For example: “He is to blame for the way I feel now.” or “This wouldn''t be happening if the Startup founder planned better.”

Unfair Comparisons: You interpret events in terms of standards that are unrealistic by focusing primarily on others who do better than you and then judging yourself inferior in the comparison. For example: “I could never be as smart .” or “Others did better than I did on this project.”

Regret Orientation: You focus on the idea that you could have done better in the past, rather than on what you could do better now. For example: “I could have had a better job if I had tried.” or “I shouldn’t have said that.”

What If?: You ask a series of questions about “what if” something happens, and you are never satisfied with any of the answers. For example: “Yeah, but what if my personas are off-base?” or “What if my wireframes don''t really communicate the idea?”

Emotional Reasoning: You let your feelings guide your interpretation of reality. For example: “I feel depressed; therefore, my job is not working out.”

Inability to Disconfirm: You reject any evidence or arguments that might contradict your negative thoughts. For example, when you have the thought, “I’m not good enough a interaction design”, you reject as irrelevant any evidence that shows you''re fully competent. Consequently, your thought cannot be refuted. Another example: “That’s not the real issue. There are deeper problems. There are other factors.”

Judgement Focus: You view yourself, others, and events in terms of black/white evaluations (good-bad or superior-inferior) rather than simply describing, accepting, or understanding. You are continually measuring yourself and other according to arbitrary standards and find that you and others fall short. You are focused on the judgement of others as well as your own judgements of yourself. For example: “I didn’t perform well in last week during crunch time.” or “If I take up Android UX, I won’t do well.” or “Look how successful she is. I’m not successful.”

While you''re thinking through your own mental model, don''t forget that we all have our own.

Cognitive Disruptions can be distracting, but if you''re reading this article, allow yourself the mental space to remember that learning and growing are constant, even for those whom you look up to as mentors.', '["ux","method"]'::jsonb, 4, 60),
('u-method-week-atomic-design-micah-boswell', 'UX Method of the Week: Atomic Design', '2016-08-12', 'Atomic Design is a system of organization for elements the comprise a visual experience. It''s especially helpful to use when elements (field boxes, action buttons) are used repeatedly throughout an experience. For those ', 'broadcast traced to a control room. operator wanted you to notice.', 'Atomic Design is a system of organization for elements the comprise a visual experience. It''s especially helpful to use when elements (field boxes, action buttons) are used repeatedly throughout an experience. For those of you struggling with how best to organize and manage a style guide Atomic Design, with an addendum to the system setting forth ''Principles'' (the how /when/what of the Atomic Design system) may be extremely useful.

Whereas an Atom may be a field box, a molecule is a combination of Atoms, for example, a field box and an action button for a search bar. Organisms are a combination of molecules that may exist for a header area, and templates are most often a combination of organisms. A ''page'' is best though of as a screen ''instance''.

In the past, we''ve seen extensive Pattern Libraries, such as BBC''s GEL or Dell''s own massive Pattern Library - the Atomic Design concept is a natural evolution of pattern organization.

For more information from Atomic Design''s primary source, the venerable Mr. Brad Frost, visit his article here.

Although Brad''s article focuses on Web Design, The Atomic Design system works well with mobile, embedded and HUD experiences as well - on any design system where ''Atoms'' are re-used in different combinations within the same experience.

Header Image Credit: Brad Frost
Body Image Credit: Dell Design Library', '["ux","method","strategy"]'::jsonb, 1, 70),
('ux-method-week-journey-mapping-micah-boswell', 'UX Method of the Week: Journey Mapping', '2016-08-05', 'A Journey Map is a method used to capture the various activities, intents and phases a particular area of focus (audience, product) takes through a given lifecycle. It''s especially useful to use with customers in mapping', 'broadcast traced to a control room. operator wanted you to notice.', 'A Journey Map is a method used to capture the various activities, intents and phases a particular area of focus (audience, product) takes through a given lifecycle. It''s especially useful to use with customers in mapping out activities from their point of view. Journey Mapping can also be used for a product or service, and can also be referred to as a Lifecycle Assessment.

An effective Journey Map is researched based, and often captures interactions & phases outside of the the realm of direct interaction with the product/service in question. For example, it may capture morning activities involving preparation for the day. A crucial element of a Journey Map is to understand the context of a consumer''s priorities, and how a product or service fits into a person''s life. When a customer interacts with the product or service, it''s referred to as a ''Touchpoint''.

Simply put, a Journey Map serves to inform its audience about the universe in which the area of focus lives in - the activities, the intents of each activity, and the phases involved for each. It can be as specific as focusing in on the Journey of a Shopper through an eCommerce experience, or can be as general as focusing on the daily habits of a working mother.

Check out Jim Kalbach''s book on Mapping Experiences, as well as his excellent article on key questions to ask before getting started.

" Customers who have inconsistent, broken experiences with products and services are understandably frustrated. But it’s worse when people inside these companies can’t pinpoint the problem because they’re too focused on business processes. This practical book shows your company how to use alignment diagrams to turn valuable customer observations into actionable insight. With this unique tool, you can visually map your existing customer experience and envision future solutions. Product and brand managers, marketing specialists, and business owners will learn how experience diagramming can help determine where business goals and customer perspectives intersect. Once you’re armed with this data, you can provide users with real value."', '["ux","method"]'::jsonb, 2, 80),
('who-your-organizations-unsung-heroes-micah-boswell', 'Who Are Your Organization''s Unsung Heroes?', '2016-08-03', 'You walk through the revolving door, in and out of work every day. Often times, the first face you see is that of Samuel. He works security, but he always has the time to smile and greet you. Without realizing it, Samuel', 'received during a strategic decay window. content survived.', 'You walk through the revolving door, in and out of work every day. Often times, the first face you see is that of Samuel. He works security, but he always has the time to smile and greet you. Without realizing it, Samuel has set the tone for your day.

Whenever you stay late, Larry swings by to empty trash bins. He''s careful to separate recycling materials first, and is always the first to report a broken light-sensor or door left open. He''s been a custodian of your headquarters for more than 15 years. Without realizing it, Larry has saved the organization money, and most likely impeded more than one security breach during his time there.

Julia is an engineer and developer. She quietly sits in her undecorated cube. From time to time, she swings by to talk about the small things that can be done to better communicate the challenges and opportunities she sees within the organization. Without realizing it, Julia has contributed to the continuous improvement process, and made it a better place to work.

Most organizations have some review and reward method, but it''s an inevitable reality that all organizations have unsung heroes - those people that go above and beyond, not because they have to, or because they want the next salary bump, but because of who they are.

Don''t wait for someone else to recognize your unsung heroes who make your organization a better place. Champion their cause and recognize their efforts.

A culture of recognition lasts longer and is more effective when it''s created not by decree, but by people like you, who are willing to bring attention to it.

Is there an unsung hero in your midst who deserves recognition?', '["strategy"]'::jsonb, 1, 90),
('experience-strategy-transformational-tool-micah-boswell', 'Experience Strategy as a Transformational Tool', '2016-07-30', 'Often times, Experience Strategists are asked to focus on a specific element of a marketing or communications medium, be it the mobile experience, or an advertising campaign. Relegated to the purpose of crafting the mess', 'received during a strategic decay window. content survived.', 'Often times, Experience Strategists are asked to focus on a specific element of a marketing or communications medium, be it the mobile experience, or an advertising campaign. Relegated to the purpose of crafting the messaging experience for a product or a service, we often discover that core issues and challenges exist not within the medium or message of the experience, but within the actual product or service itself.

What does an Experience Strategist do when they realize that the product or service they''re packaging is ultimately the real challenge?

When we spot a disconnect between the value proposition and the real value, what''s the best approach to take?

Mary Wells Lawrence was in many ways a traditional Creative Director and Principal. But in other ways, she was an Experience Strategist like no other. And her example with Ford and Braniff can serve as a template for modern Experience Strategists and Designers looking for ways to create successful experiences that genuinely reflect the best of an organization and its products and services.

With Ford''s ''Quality is Job 1'' campaign, Mary transformed the way the car company was viewed, during a time when Ford had lost much of its brand luster. She didn''t do so just with just clever copywriting, but with a deep look into the organization, and what she believed were genuine values and strengths of the organization. Her visits to Ford factories left her deeply impressed with the dedication & hard work of Ford''s employees. Mary explored and researched the full lifecycle of the product, as well as the customer, and after ruffling lots of feathers, she proposed an advertising campaign that honestly advocated the strengths of Ford. Beyond that, she made recommendations to the organization that went beyond marketing. Her bird''s eye view into the organization led to improvements that went well beyond Ford''s advertising effects.

Braniff''s ''End of the Plain Plane'' campaign is close to my heart. Flying from Lima to Miami as a child, I vividly remember the duo-toned airplanes, the soft, beautiful blankets and the exquisitely designed interiors. Much like with Ford, Mary didn''t just create a new set of tag lines and slogans for Braniff - she helped the organization create a unique value proposition by successfully pushing through a creative concept that started with actually making the Braniff flying experience unique. Emilio Pucci was hired to design plane interiors, Alexander Calder was hired to paint an Airplane, and more. Ultimately, the campaign was a huge success. Mary had helped Braniff create an experience that started with redefining the product itself, then moved to creating an advertising campaign that effectively communicated that experience.

Mary Wells Lawrence was a successful Experience Strategist because her focus wasn''t just on the ''How'' of communicating a value proposition. She was brilliant at being able to understand what was being proposed, and started there. If she saw an issue there, this is where her work began, so that the advertising story was a reflection, not a ruse.

Much like Mary, we have to get away from Experiences Strategies that are Silo''ed in the Marketing and/IT Departments.

We have to be willing to take on the hard work of mapping out the product/service itself, and how it connects to the customer journey. We have to have the kinds of conversations that lead to connecting the real pitch with the real product, the story with the substance, and the value with the voice.

All too often, interactive advertising campaigns come across as being less than genuine, because they begin and end with the IT or Interactive Marketing Department or outside agency. Mary can remind us all that the best stories that a product or service can tell are the stories that are a genuine reflection of the whole organization. If there is no unique story to tell, don''t make one up - challenge the organization to start the campaign from the inside out to create a compelling story - a story that comes across as real, because it is.

Serve the organization by capturing the real value proposition. If you see opportunities, help to create new value propositions. Then, the work can begin to convey it, just as Mary did, with style and substance. Capture, Create, Convey.

Header Image - Braniff Airlines - All other images herein belong to the respective brands.', '["strategy"]'::jsonb, 3, 100),
('ux-method-week-culture-mapping-micah-boswell', 'UX Method of the Week: Culture Mapping', '2016-07-29', 'While one may not immediately recognize Culture Mapping as a traditional activity or deliverable in the UX practitioner''s toolbox, Culture Mapping serves as an important method to gather context about Internal Stakeholde', 'broadcast traced to a control room. operator wanted you to notice.', 'While one may not immediately recognize Culture Mapping as a traditional activity or deliverable in the UX practitioner''s toolbox, Culture Mapping serves as an important method to gather context about Internal Stakeholders, Executive Owners, and the world in which a project/service originated from. It''s especially helpful when in Discovery Phase, and when working on a project the organization may not fully support or understand.

Although Dave Gray''s focus is Culture Mapping as a prerequisite before embarking on a Change Management initiative, it''s also incredibly helpful to discover invisible stakeholders, cultural speed bumps and hidden UX champions.

"Culture Mapping is like sending in a team with a fast, motorized rubber raft, to scope out the harbor and plant big red flags to mark the rocks under the surface. To find the deep water and favorable currents. To scope out hostile and friendly forces. To map the territory, so you can navigate the safer waters and give your larger mission the best possible chances for success."', '["ux","method","strategy"]'::jsonb, 1, 110),
('Sketch 39_ Improvements in Responsive Sizing', 'Sketch 39: Improvements in Responsive Sizing', '2016-07-23', 'For many of us, working with Sketch has been a fantastically useful, efficient and even fun experience for creating application and web interfaces.', 'caught between channels. no station claimed it.', 'For many of us, working with Sketch has been a fantastically useful, efficient and even fun experience for creating application and web interfaces.

With the release of Sketch 39, the UI creation experience is now even more powerful.', '["essay"]'::jsonb, 1, 120),
('ux-method-week-lean-user-research-micah-boswell', 'UX Method of the Week: Lean User Research', '2016-07-22', '"Sometimes, beautiful products don''t solve people''s problems."', 'broadcast traced to a control room. operator wanted you to notice.', '"Sometimes, beautiful products don''t solve people''s problems."

In Tomer Sharon''s book, "Validating Product Ideas: Through Lean User Research" he discusses User Workflows, How to find participants for research, and more. An absolute necessity of a read for UX Professionals.

“There’s no doubt that personal pain signals there’s an opportunity to solve a problem. Many entrepreneurs are sure they have a problem worth solving due to their own personal experience. But, they often fail to recognize that an almost tangible “fact” in their mind is just an assumption that should be tested, validated, or most likely, invalidated.”

What is Lean User Research?
"Lean user research is a discipline that provides insights into users, their perspectives, and their abilities to use products and then gives this information to the right people at the right time so that the research is invaluable for developing products. Lean user research focuses on answering three big questions about people: What do people need? (See Chapter 1 of Tomer Sharon''s book below) What do people want? (See Chapter 5 of Tomer Sharon''s book below) Can people use the thing? (See Chapter 6 of Tomer Sharon''s book below)"

I highly recommend this book - Tomer provides actionable resources and tools, as well as a Youtube channel with practice videos to demonstrate the application of Lean User Research.

Tomer Sharon''s Book Site:
Validating Product Ideas: Through Lean User Research

UX Booth''s Interview with Tomer Sharon:
Lean + Research = Success', '["ux","method"]'::jsonb, 1, 130),
('ux-designstrategy-sustainability-micah-boswell', 'UX Design/Strategy and Sustainability', '2016-07-20', 'Sustainability. A word that conjures up images of words like ''carbon neutral'', and images of conference rooms with lights and central air that are aware of inhabitants. Sustainability is a word we see and often associate', 'broadcast traced to a control room. operator wanted you to notice.', 'Sustainability. A word that conjures up images of words like ''carbon neutral'', and images of conference rooms with lights and central air that are aware of inhabitants. Sustainability is a word we see and often associate with infrastructure.

But Sustainability can also be a set of activities and deliverables that are associated with Experience Design - We can have immense influence and impact in incorporating Sustainability Thinking into Strategy and Design with something as simple as championing product/service journey mapping that extends beyond manufacturing and distribution. We can have immense influence by championing a greener look at products and services, pushing for the need to map out the real environmental price of every touchpoint, including e-commerce hosting, online content bloat and delivery packaging.

Lifecycle Assessment/Analysis 
In recent years, many large organizations have been looking at the products they manufacture to assess the impact the product has from cradle to grave. In previous years, that lifecycle assessment might not have included the environmental impact of the natural resources the product required, or the amount of waste the packaging created. A promising trend is the extension of the Lifecycle Assessment to include these kinds of environmental impacts.

For Experience Designers and Strategists, the opportunity is the same, and the skills we bring to the table can be immensely useful. For example, often times, our focus is on the customer journey, and through processes like Customer Journey Mapping, we''re able to pinpoint gaps and opportunities for creating a more holistic experience.

But we can take this a step further - using mapping techniques, we have a unique opportunity to assess the journey of a product or a service from cradle to grave, not only incorporating manufacturing, but the environmental impact of those elements that aren''t specifically within manufacturing, including experience design and marketing.

+ What is the environmental impact of the decisions made in product/service design?
A product journey map could unveil an opportunity to minimize packaging and the use of styrofoam, or commit to a package design that relies more on recycled materials. Something as simple as having a conversation with how the product is shipped to the customer from the warehouse can lead to greener results.

+ What is the impact of the choices being made in marketing, from the hosting company of the online experience, to the ecommerce vendors being chosen to process orders and ship the product? 
Even with a digital product, questions and analysis regarding the hosting provided for the product/service site can lead to opportunities to extend sustainability savings. 
See the image below, created by Mightybytes.

Chris Adams mapped out the process he and his team went through to create a sustainable online experience here:

Actual Link:
https://app.mural.ly/t/productscience/m/productscience/1450000827558/view/1235476403

The journey Chris documents is immensely enlightening, and provides Experience Designers and Strategists with tools and resources to emulate the process of injecting Sustainability Thinking into digital product/service design.

+ How can your organization/Small Business learn more about opportunities for sustainability in your business. How can we champion ourselves as being committed to Sustainability in Design once we''ve incorporate these values?
"B Corps are for-profit companies certified by the nonprofit B Lab to meet rigorous standards of social and environmental performance, accountability, and transparency."

Encourage your organization to look into becoming a B Corp through the implementation of B Corp Values.

+ How can I learn more about Sustainability so that I can apply the thinking to Experience Design and Strategy?
There are many Sustainability training and certification programs. The ISSP is the best place to start. While not directly related to UX, this type of training may open the door to new ideas in how best to apply the thinking to Experience Design and Strategy.

Extending the vision of sustainability into the realm of Experience Design is full of opportunity. There''s no better time to begin the journey of integrating Sustainability Thinking into your Experience Practice than now. Sometimes it''s as simple as asking the right questions, and helping your team understand that even design decisions have an environmental price that is all too often ignored.', '["ux","strategy","sustainability"]'::jsonb, 3, 140),
('The Epistemology of UI & UX', 'The Epistemology of UI & UX', '2016-07-15', 'The confusion is prevalent, and the arguments it generates are never-ending. What is the difference between UX and UI? Are they different at all? Why do these terms cause confusion, even within the very industry that cre', 'broadcast traced to a control room. operator wanted you to notice.', 'The confusion is prevalent, and the arguments it generates are never-ending. What is the difference between UX and UI? Are they different at all? Why do these terms cause confusion, even within the very industry that created them?', '["ux"]'::jsonb, 1, 150),
('aging-industry-micah-boswell', 'Aging With The Internet', '2016-07-14', 'I created the header image with Kai Krause''s Bryce, and edited it in Photoshop 2.5 on a Performa 550. Photoshop 2.5 came in about 8 3.5 inch floppy disks - they were my lifeline.', 'caught between channels. no station claimed it.', 'I created the header image with Kai Krause''s Bryce, and edited it in Photoshop 2.5 on a Performa 550. Photoshop 2.5 came in about 8 3.5 inch floppy disks - they were my lifeline.

It seems like only yesterday that I jumped into the Internet. It was 1994, and discovering the possibilities that online connections yielded were incredibly exciting. With my Performa and Mosaic, I felt like the whole world had opened up to me.

I was an avid user of Bulletin Board Systems before then - paying peak-time minute-fees to log in to ASCII based online communities to connect with other artists and friends. I remember a particular BBS system I used my 9600 baud modem to connect to. It was in California, and the price of an unexpectedly long but amazing conversation cost me a cool 400 Dollars.

I remember struggling to teach myself how to use Adobe PageMill, and figuring out what indexed color meant - I remember trying to figure out what binary meant when trying to FTP my files up via a small, lovely app named Fetch.

It''s been more than 20 years, and I''m still in love with the interactive business.

I''ve lived through browser-based virtual reality plugins, HTML frames, Cyberdog, Netscape bloat, IPO parties everywhere, The Dot Com Bust, The Second Coming of Apple and now the seemingly impending demise of Flash - a powerful little plugin I remember as Future Splash.

I remember the struggles to articulate bandwidth constraints, and I remember the challenge in trying to access user statistics. I remember the fixation with website hits before we had the tools to track and articulate actual user behavior.

You may not share the memory of these names or events, but if you do, they mold our thoughts about the present in unexpected ways.

These days, I see the ease in which people born in the digital age take to online communication - how quickly my son learned to swipe and tap on his iPad. I watch in awe as younger developers create incredibly beautiful experiences, and designers code with ease.

The journey has been humbling, and at times, I pause to wonder if my usefulness has run its course. I''m now the old guy in some groups and, filled with awe and respect for younger talent, that same wonder can sometimes turn to worry.

If you''re growing older with an industry, you have much to offer, and although you may suffer from the same moments of doubt that I do, work to discover the differences between valuable insight and a grudge that''s crusted over time.

Experience is a priceless thing, and when that experience becomes wisdom, there''s immense value that can''t be replaced.

There''s so much to give, but so much to learn. Don''t assume that your age is a hierarchy of learning. Take the time to remove the assumptions people can make about generational differences. Learning isn''t linear, and that new 20-something sitting across from you may open your eyes to things you''ve never considered.

Know that your experience is priceless, but understand that how and when you communicate it is just as important as its value.

You may be the 20-something, coming to work, wondering how you''ll manage to pay off the student loans in the next decade. You look across at the senior manager, and wonder how he''s managed to keep his cool in such stressful situations.

Time can help someone understand what''s worth worrying about. A youthful worldview can teach us what''s worth getting excited about again.

You see his pictures of kids, and maybe even grandkids - you may find it awkward to collaborate with a guy who has kids your age.

But both of you make a great team. You both bring amazing skills, insights and abilities to the table, and when both of you find the common ground to build trust, great things can happen.

Find the common ground with your team, regardless of the abundance or shortage of years each brings to the table.

The dividing lines between generations aren''t created when we acknowledge differences in age. They are created when we believe generations have no commonality, and doubt the ability to understand the other.

Remember that insight isn''t gained chronologically - your 20-something account executive most likely has had experiences you haven''t had.

Generational views can at times be very different - norms and global events can shape worldviews. However, finding the common ground can help you understand those differences, and perhaps even teach you the value in those differences. Growing up during a war can affect your view of military service. Growing up in a recession can affect your view of future prospects. Growing up during civil strife can affect your comfort when walking home alone.

Discover the common ground, and find value in the differences.

You may walk into a meeting where you''re hearing decisions made that could lead to mistakes you made many years ago. An Enterprise customer with strict security measures needs a new Intranet, and the team is planning on using the latest version of JQuery. You''ve been down the Javascript vs Security path.

Guide your team to the conclusions through discovery, don''t make it for them. You may discover just as much as the rest do.

Gen Yers, Millennials, Gen Xers, Baby Boomers. All categories that create lines around age. The categories themselves aren''t our collective problem - it''s when we prejudge the individual with general behaviors that creates the boundary.

Dissuade generational judgements. Champion the good you''ve seen in others over the years, and remember that each individual deserves the opportunity to succeed, and to be seen as such, regardless of age.

Who you are is not defined by the sum of your days, but by the kinds of experiences you''ve collected, and how you''ve let them touch you. In that sense, each of us has a unique perspective.

I''m getting older. There was no choice in that. And the need to share what I''ve learned is growing. But I see that as I''ve grown older, others who are much younger than I am have chosen to grow up in ways I haven''t yet.', '["essay"]'::jsonb, 5, 160),
('ux-critical-thinking-micah-boswell', 'UX & Critical Thinking', '2016-07-12', 'Months pass, and technologies change. I often find myself scouring through the list of new prototyping and research tools available, trying to decide which new tools I should invest time in learning. The search is perpet', 'broadcast traced to a control room. operator wanted you to notice.', 'Months pass, and technologies change. I often find myself scouring through the list of new prototyping and research tools available, trying to decide which new tools I should invest time in learning. The search is perpetual, and the learning curve is constant. But throughout my UX career, one core talent has kept me thriving and able to take on new challenges. It''s not the Creative Suite. It''s not the ability to quickly wireframe in Axure.

It could be assumed that to learn Axure or the Adobe Creative Suite, one must have this skill, but that''s an assumption that organizations looking for UX talent can''t afford to make.

The argument could be made that, often times, the UX role has evolved into a multiplicity of sub-roles, many requiring the consumption and production of an experience that''s already been planned - but even here, critical thinking skills are essential to effectively consume and produce what''s been planned.

What I mean by critical thinking skills is the ability to get past language to get at the core of any issue, challenge or project. The ability to not just ask the right questions, but to use both empathy and analysis to move beyond the semantic presentation of concepts, and know how to frame conversations to get to the real issues. In discovering how people prefer to communicate, you''ll come to realize that communication preferences vary radically, and while direct questions may work well with some, open-ended conversations work well with others.

"Our Subject Matter Expert stated that dark backgrounds are hard for all engineers to use because white letters and numbers are hard to read."

A Subject Matter Expert''s observations may be invalidated by how their opinions are documented. Even in Heuristic testing, it''s important to

3. Ask the kinds of questions & plan the kinds of tests that filter out personal taste from actual task testing results.

"If we move to an AGILE process, we''ll lose our ability to effectively document features."

This is an argument that''s prevalent when introducing an AGILE process to a company or group that''s still in Waterfall mode. Get to the core of the issue. Is it that you''ve moved your development team over to AGILE, but your technical writers are still working in Waterfall mode?

1. AGILE is most effective when every team member supporting the project is integrated into the process. This includes your document and training experts.

2. Make sure you effectively explain/mentor AGILE to everyone on the team, including the experts who aren''t on the development team.

"We can''t switch to the new platform. Our users are used to ASCII printouts, and they prefer it because that''s what they''re used to."

In any environment where a UX practitioner is introducing change, there will most likely be resistance. An effective UX leader is not going to assume that ''same is always better'', however, an effective UX leader is also not going to assume that ''change is always better''.

1. Understand the tasks that your solution will replace/revise.

3. Document learning curves, and assess available time for training .

5. Test your new solution by having a small group of users perform the same set of tasks. Be honest - are you solving for the right problems?

6. Assess your audience, and identify your key personality types - your change resistors, your early adopters, and those in between. When you document input, make sure that one of your data points is this assessment. People who enthusiastically sign up for user testing are often the early adopters wanting to try new things. This can obviously skew your results if your audience as a whole are change resistors.

"A/B testing has consistently led to poor results. Bob wants to know why we don''t do A/B/C testing. He believes that if we give people a third option, we''ll definitely get better results."

This is a common challenge many UX researchers run into. A lack of understanding in terms of what A/B testing tries to accomplish is most often the key issue.

2. Assess the source material to assure that the choices being tested are in fact two separate experiences.

"My designer is really frustrated with our feedback regarding the low contrast in his designs. Since there''s low contrast in the dark interface, he wants permission to re-do the whole interface in white."

UX designers suffer innumerable criticisms, but none should ever be taken personally. An emotional response to criticism can lead to a fallacious conclusion as seen in the above example. The problem with low contrast also exists in interfaces that are light/white. Switching could lead to the same contrast problems, leading to delays and expenditures that haven''t been planned for.

1. Separate the reaction from the criticism, and test for the core issue.

3. Empower the designer by allowing for task testing with a series of interface screens, and minimize questions that allow for users to influence the interface with personal taste.

"It''s been two months since the new site launched, and online sales have declined. I told you that going with this design was a bad idea."

The months after a launch are very important to plan for. Any number of factors can play into the success or failure of a launch, but without the right analytics tools surrounding the experience, a ''False Cause'' argument can permanently affect relationships with vendors, and even relationships within the organization. The success of a new experience can''t be gauged in two months - so many factors can come into play, that without the proper analytics, there''s no way of painting the real picture.

1. False Causes, or false relationships between two truly unrelated factors can sink your project. To avoid this, prepare well in advance of a launch with objective tools that will paint a clear picture for your team and for the executive team.

2. Validation of the experience does not happen just at the beginning or at the end of your project. The customer feedback loop should be ongoing and iterative.

3. Formalize the feedback loop, incorporating feedback into your experience as you refine it. Document the manner in which the experience evolves based on user feedback so that stakeholders can clearly see the evolution. No surprises.

"Our lead developer believes that a responsive website will yield better results, but our customer insists on a native app. I''m not going to disagree with our customer over what our developer is saying "

Planning and designing the User Experience should be collaborative. Granted, you may have already committed to building a native application, but integrating developers into the planning and design process will ultimately save you time and money - and the results will often be much better.

1. UX is collaborative. Not everyone''s voice is as important, but if you''re not opening the experience up to collaborative sessions, you''re missing out on a process that can not only make for a better product, but also build a deeper sense of ownership with the team as a whole.

2. The reality of planning an experience is that many UX practitioners aren''t aware of the resource impact it has. Always find a way to assess the benefits of a particular experience with the cost of developing it. Find a way to weigh benefit vs cost, and communicate that to the team so that everyone is aware of the impact versus the price.

"Thank you for coming to our testing lab. Our last question we have for you. How much easier is this new interface to use compared to the older interface?"

Loaded questions are unfortunately more common than they should be in the UX world. They lead to skewed results, and produce experiences that are a reflection of the biases of those planning it.

1. Step back from your work, and question your own assumptions. Assess the testing process to make sure that your own biases are left at the door.

2. Partner with other UX resources - and have them help you make sure that you haven''t become blind to your own confirmation bias.

3. Have your team vet your testing process to make sure that they understand what you''re testing.

"This is the way every other Checkout flow is laid out. There''s no need for us waste time on this - someone else did the homework, we can just re-use what they did."

Cart abandonment continues to be the bane of existence for so many experience strategists. The product page can make or break an experience - this is the last thing an experience designer wants to hear.

1. Checkout flows are in fact very different from one another. Depending on the nature of your product, as well as the type of audience(s) you''re selling to, some tweaks to the process can significantly affect cart abandonment.

2. Partner with an analyst, collect research on best practices within your industry, and test, test, test. Be aware of the differences in audience and timing when you test. Be aware of user intent, and make sure to work with the analyst to assure that online window shoppers don''t skew your results.

"I''m not a User Experience Designer if I''m not directly interacting with the user."

Let''s face it, the term ''user experience'' is an often-abused term. Today, a user experience practitioner can be doing anything from development all the way to research.

1. Make sure you appropriately understand how the hiring organization defines the term ''User Experience''.

2. Make sure you understand what the term can imply in this day and age. UX covers a wide realm of roles, all meant to be ''user-centric'', but not all meant to give you direct access to the user.

"I read Jakob Nielsen''s article, and I only tested with 5 people because that''s what Nielsen recommends."

While Jakob Nielsen did recommend this some time ago, there are many things to consider.

1. If you have a disparate target market for your product in a very specialized field, are you testing 5 people per target market?

2. Do those 5 people accurately represent every user type, as well as competence level?

3. Do all 5 represent every intent that the user will have in mind when using your product?

"People don''t want to read too much on their mobile device. It''s natural for people to just scan on Mobile, because they''re on the go."

A useful rule of thumb is to never base your experience on assumptions about what is natural when dealing with emerging technologies. The Mobile experience is still emerging, and how people interact with your experience may surprise the proponents of ''natural use''.

1. Not all content is the same. Don''t succumb to the argument someone else is positing, especially if they''re citing a general statement regarding human nature.

2. How people interact with their mobile devices is highly dependent on a number of factors, including your content, user intent, time and place. The argument that people only skim through content when they''re ''on the go'' with a mobile device is highly dependent on the above factors and more.

"Our user base is the aging. As we know, the aging will be technically at a novice level, and they''ll want to print out the page."

There are many assumptions we make about our target markets, but no assumption is more false than assumptions made about the aging market. Although Macular Degeneration and general loss of eye sight is most often related to age, there are many assumptions about the aging, especially in regards to preferences in the experience that are ill-informed.

1. Treat each target market with the respect they deserve, and test experiences with each. Integrate those results into your experience, and you''ll find that the respect you gave will be repaid in full.

2. E-Commerce analysts will be the first to tell you that the aging may vary more in preferences than Millennials.

3. Don''t connect research findings with an assumption. You may discover that coin collectors like to print out the product page when they buy a coin, but don''t assume that the reason lies within an antiquated preference for paper.

"My mother doesn''t like carousels. When she visits our e-commerce site, she just wants to get to the sale of the day as quickly as possible."

We all love our mothers, but your mother may not be the typical user. Even if she is, her intent in visiting your experience may very well be one of the many intents your users have when visiting your experience.

1. Help your team understand the value of anecdotes as a way to connect with the user base only when its understood that it''s a small part of the overall experience you''re trying to capture.

2. Anecdotes have their place and value. They do not have value at the stage when you''re trying to assess your true target market. This can be especially tough if a stakeholder is convinced you don''t need a research budget because "he knows his customers better than anyone does."

"We can''t move forward because QA is blaming the BA''s for the lack of appropriate requirements to test off of, but the BA''s believe that the QA team don''t understand true AGILE."

Within this one statement there are two challenges wrapped in one. At face value, the BA''s and the QA team are at an impasse, criticizing each other. The reality is that this very common problem has a simple operational solution.

1. AGILE can sometimes leave a QA team with some degree of headache - that is, if QA isn''t effectively engaged from the outset.

2. AGILE doesn''t mean ''no documentation'', it means ''enough to create a shared understanding''. However, if the QA team is involved from the outset, then part of this problem is resolved.

3. UX practitioners are most effective when they are involved and have activities at every stage of the AGILE process. An effective UX practitioner can help resolve this conflict by assuring that the QA team has access to the wireframes, prototypes and mock-ups early on.

"The UX team can''t prove that users won''t like an unannounced soft launch tonight. If they want to postpone the soft launch, they''re going to have to prove that."

When designing the experience, the burden of proof should fall at the feet of the UX practitioner. But there are often aspects of a project that fall out of the realm of the control of the UX team. Experience designers often have a solid grasp of the effects of both good and ineffective change-management.

1. Let your UX team communicate with anyone who touches the lifecycle of the product or service. From inception to customer support, the UX practitioner should have access to the big picture.

2. You may just be hiring a UX developer, but even at that level of practice, access to the full lifecycle could fundamentally change the approach your developer takes.

"Your budget doesn''t include any resources for user research or testing. No real UX talent is going to take this job."

UX is a relatively new corporate job slot. And entering into an environment with either no UX practice, or an immature UX practice can be exciting and rewarding.

1. Even in this day, many Fortune 500 companies are on the low side of the Maturity Scale when it comes to the integration of UX talent into their organizations. Understand where the organization is, be honest about it, and look for UX talent that is both experienced in the field, and able to evangelize the advantages of moving up the Maturity Scale.

2. Empower that UX hire to talk to all departments regarding what User Experience is about. Doing so will empower the organization to understand UX, as well was empower your UX practitioners to scale their own talent in understanding not only the customer journey, but the product/service journey as well.

"We''ve moved to AGILE, and since then, our stakeholders don''t know what''s done and what''s not done."

The Waterfall to AGILE transition is often met with some degree of confusion when stakeholders are deeply invested in a culture of ''final deliverables''.

1. UX practitioners are principal actors in creating change in organizations. Understand the general reactions all people have to change, and understand how best to evangelize the benefits when need be.

2. Understand why people are making the connections between the changes you introduced and the perceived negatives. Deal with each accordingly - not all resistance is the same. Some may not understand and only need access to the rationale, while others may simply resist change for what it is.

"I know we need for the new UX person to talk to our users. That''s what those guys do. They talk to people."

Sometimes those who are our greatest champions, do so not because they fully understand what we do, but because they''ve seen the results, and know it works.

1. Care for your champions. Involve them in your process. Empower them to advocate your cause with knowledge and accuracy.

2. Be willing to make new champions by taking the extra time to provide luncheon seminars, informal updates on progress, and involving non-stakeholders in the conversation about the experience.

"After mentioning the cost of formal Usability Lab tests, our executive team found it hard to believe that usability should cost that much."

Formal research can yield exponential results. There are times when a more formal approach is needed, and articulating these reasons, as well as why a formal user study costs what it does, is critical.

1. If you''ve concluded that a more formal usability study is needed, substantiate the reasons as well as the benefits.

2. Take it a step further and itemize costs, so that a team that''s not familiar with this kind of testing can understand what the investment is for.

"I''m concerned about the Mobile Experience. I went to a conference, and I saw one of our major customers frown when he saw the new filtering tool."

Nothing should frustrate a UX practitioner more than ambiguity. In scenarios like this, there''s little that can be done without some form of follow-up.

1. Never be afraid to ask a question. Ambiguity can''t be eliminated without communication. Don''t second-guess yourself - ask about talking directly with that customer.

2. Understand how best to get people to talk about themselves. Make them comfortable. Some people prefer open-ended questions, while others prefer to validate or invalidate statements. Discover each person''s mental-model, or how they view the world.

"We can''t use this data. It''s just something a Call Center person thinks."

Be open to the findings from other groups that aren''t part of the UX realm. In my experience, the Customer Call Center is the least utilized source of amazing user insight. These humble support employees deal with the very best and very worst of the user base, and their knowledge is completely invaluable to the crafting of a new experience.

1. Check your own prejudices, and make sure you''re open to feedback from groups outside of the UX realm.

2. Find your Customer Support Center and build a relationship with the team.

"Bob says he wants the default font size to be 15. Nancy says she wants the font size to be 13. We''re going to make it 14, and everyone will get some of what they want."

The art of compromise is an essential skill for any UX practitioner to learn. However, it''s a mistake to believe that every compromise is the right choice.

1. Pick your battles carefully, and know that most experiences that are robust don''t happen in one release stage. Sometimes it''s time to fight for the right thing, sometimes it''s time to let that issue go and move on.

2. Being willing to compromise requires that you understand the costs associated. Never be too far away from the realities of the budget, timeline and available resources. Know the price of winning and losing battles.

In conclusion, the art of critical thinking requires a mastery of empathy, coupled with analytical skills. Critical thinking is the one core talent every UX talent should strive for, and the one core talent at the top of the job requirements list. Mind you, critical thinking doesn''t stop me from making mistakes. I''ve had more than my share of those. However, it provides me with the right mindset to give the mistakes context, and turn them into learning lessons.

Do you have any examples of fallacies you''ve experienced in the UX world? Let me know what they are!', '["ux","method","practice"]'::jsonb, 16, 170);

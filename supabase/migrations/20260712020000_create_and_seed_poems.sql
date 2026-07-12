/*
  # poems — the verse corpus behind the terminal

  Backs the `verse` command in DeadDropConsole. Public read; no client
  writes. Seeded from the vault 📝 Poems/ collection: all poems except
  the six about Micah's son (Nova, Still his dad, Tuesday night, What
  dads do, Inheritance, Mayakovski's Ghost). The 'nova' theme tag is
  stripped from survivors so `verse nova` surfaces nothing.
  38 poems.
*/

create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  themes text[] not null default '{}',
  order_index int not null,
  created_at timestamptz not null default now()
);

alter table public.poems enable row level security;
drop policy if exists "Anyone can read poems" on public.poems;
create policy "Anyone can read poems" on public.poems
  for select to public using (true);

insert into public.poems (slug, title, body, themes, order_index) values
  ('3-33', '3.33', 'A restless dreaming sky.
I woke thinking,
or maybe I never slept.

Dreams and thoughts tangled,
threaded with worry. the noise
of deadlines, personalities, pretending.
People swirling, processes grinding.

The ocean is distant,
far from my eyes.

Another day slides in.
I look at my phone
3:33 am again, the old riddle.

I think about shaving my head,
each persistent hair fewer than before.
I admire their endurance,
the way they insist
my fight isn’t finished.

Some futures trading at four am.
Maybe I''ll make it work this time.

I keep hoping
to stop selling my time for money.

this currency, time,
spent with cathode rays in gray cubicles,
and in love affairs
where neither of us loved me.

There isn’t so much left now.
Most is spent.

The mind goes wandering.

I pay Spotify to rent music,
once I owned the vines
of my sadness.

Now I am a serf, like ancestors,
tilling land I never keep,
the baron, a subscription model.

My mind twists, a radio’s dial
spinning wild through static;

my heart, unsupervised,
crawls into dark places.

Then, a flash of awareness.
A gentle smile.

Here, in this minute,
I choose to feel, to think.

I press down on the tuner,
hold hands with my muse.

Grateful for the gift.

5:55 am

Three miles away, my son sleeps,
strong and true.

I''ve helped raise a young man 
I can''t live without
to live without me

Beyond fatherhood,

I''ve wandered, for 40 years,
my own desert, witnessing
the lights and shadows.

In this moment of worries and rumination,
I choose to guide my thoughts instead.

To offer thanks
to the universe, to my abba.

For a life I can shape,
for wings that feel the morning air.

This dawn is another journey.

The dark walk
has led me through awe
and gratitude.

To call myself fully human,
to regret, and celebrate.

Proof I''ve lived, and lived it well.', '{faith,memoir,caryn,aging}', 0),
  ('abilene', 'Abilene', 'Thanks for reading Fundamentally Yours! Subscribe for free to receive new posts and support my work.', '{}', 1),
  ('bring-back-the-family-pride', 'Bring Back The Family Pride', 'Wife holds a divine role, love and nurture define her soul Husband guards a sacred space, leads with strength and gentle grace Raise sons and daughters in joy, a heavenly gift to employ No greater role than ‘mom’ or ‘dad’, a legacy we must add Bring back the family pride Celebrate the love inside God treasures the family heart Wife serves with a holy art Husband’s kind and steady hand God blesses this loving band [Bridge] In times of trial, stand together, weather every storm Mom and Dad, side by side, keep the family warm Husband leads with courage, Wife nurtures with care, Through challenges, they both rise, a perfect pair [Verse] Children learn from what they see, the love they give is free In every smile from Dad, every hug from Mom, there’s a bond that’s clear Husband’s strength, Wife’s gentle touch, balance that’s rare Unity from Husband, faith from Wife, and love, a legacy declared [Chorus] Bring back the family pride Celebrate the love inside God treasures the family heart Each plays their own vital part [Verse 2] Husband guides with wisdom, steering the family’s course Wife’s tender heart, a nurturing force Hand in hand, they craft a legacy vast, Building a future, learning from the past [Outro] With love as guide and anchor strong The family grows where it belongs In each embrace, in every stride Bring back the family pride', '{faith,caryn,aging}', 2),
  ('chosen-family', 'Chosen Family', 'The ones in the dark corner of the nightclub
who passed me a cigarette without asking my name...
they knew more of me than blood family ever knew.
We danced not for joy but for therapy.
The bass did not heal us, but it remembered.

At the pool bar, under the jaundiced light,
I learned to read sorrow in the way
someone held their cue stick...too tight,
like a last thing.

No one asked where you were from,
just what you’d lost
and how much you could still carry.

In the alley behind The Church, (the other one)
we told the truth while pretending not to.
A girl in fishnets taught me how to lie
without hurting anyone.
A friend called me “brother”
and it didn’t feel like theft.

I tried to explain this to a relative once.
She smiled too hard, called it a phase,
and made me boiled cabbage
as if hunger was all that needed filling.

It''s not for lack of trying, but lack of knowing
that I''m not a child anymore.
More than a middle one,
and certainly more than a wayward, prodigal relative.

Family is assumed like last names
and casseroles.
But I have found deeper kinship
in half-spilled drinks
and mid-sob laughter
with people whose parents
forgot their birthdays
but never forgot to punish their strangeness.

We chose each other.
Not out of duty.
Not out of blood.
But because when someone hands you
a piece of their undoing
and lets you keep it,
that’s love.

And that’s more than most
holiday dinners
ever gave me.', '{faith,caryn,aging}', 3),
  ('clouds-don-t-roll', 'Clouds Don''t Roll', 'In Lima, we learned to flinch young.
When soldiers passed, we turned our faces
to the Pizza Parlor in Miraflores.
We focused on Pepperoni and Mushrooms,
avoiding eye-contact and spent ammunition.

When they took Luis, we were silent.
No one told us to be. We just were.
When he came back. He wasn''t the same.
We understood.

At School, Pedro sighed -
graduation postponed, again.
Another bomb threat.

When the city of 7 million went black, it wasn’t news.
You sat still, like a prayer waiting for its god
to forget.

When death threats came,
you didn’t tell your friends. You sat
and watched another movie,
eyes fixed on the screen.

Alert, but pretending it was normal.

Ricardo made jokes.
It was funny.
There was no other
way to see it.

There were

but dark humor cut the
insanity into smaller,
more edible chunks.

When we saw the bank blow up,
we turned to walk slowly, back towards
San Isidro.

We were quiet.
Avoiding sirens,
Hiding from the army trucks.

Closer to home, we laughed.
It was a fragile sound,
full of anxious release.

Another night in Lima,
another night of absurd living.

At twenty-one, in Alabama, the cop pulled me over.
My voice cracked like dry maize.
I handed him my passport.
He laughed. I laughed. It wasn’t funny.
Casually, I watched his partner''s finger
on the safety.

Old habits die hard.

The shrapnel still in my calf pulsated
As he said ''Be safe now''
and left me alone
without asking for a bribe.

The gas station pump asked me a question
I didn’t understand. I stared at it
like a wounded man
back in Lima
waiting for the Senderistas to pass.

At the grocery store, 32 kinds of cereal.
Where is the safety in choice?

In Peru, violence had a way of behaving.
You suspected who carried the guns.
You knew not to speak English
on the wrong street. You knew
what silence bought you.

In America, the rules are airless.
The violence wears khakis
and asks how your day’s going.

The disappearance happens in slow scrolls:
in the job interview,
in the look on her face when I said
I’d never had a checking account.

I miss the clarity of Lima’s dusk.
The barking of dogs before a bombing.
The way danger felt honest.

Here, I don''t know where the guns are.
Or the gods.

No one warns you
about the hidden threats
in America.

One day you wake
and realize no one is missing.

That’s how it starts.
The war here is memory.
And the time and space to forget, then remember.', '{peru,faith,memoir,caryn,aging}', 4),
  ('come-as-you-are', 'Come As You Are', '[Bridge] Come as you are, hearts open wide, Find healing in His name, the tears are dried. No fear, no shame, in His embrace, A boundless love, a saving grace. [Chorus] He calls you tenderly to come, Into the light where you belong. In Jesus, find your song, He waits with open arms, so strong. [Verse] He calls you home, with love and grace, He wants you by his side, face to face. It doesn’t matter what you’ve done, It doesn’t matter who you are, or where you’ve run. He loves you all the same, His perfect aim. He’ll give you peace, a gentle wave, He’ll give you meaning, the life He gave. He’ll give you joy, a faithful friend, A love that never ends. He loves you so much, with every breath, His son died for you, conquering death, The ultimate sacrifice, a gift so true, His love surrounding you. Jesus extends His scarred hand, Take it now, with faith you stand. Accept Him as your Savior, live renewed, The love is yours, His grace imbued. All you need to do is profess, For Jesus cleanses, and you are blessed. [Bridge] Step forward, leave the past behind, In his love, new life you’ll find. The journey starts with this embrace, Through Jesus, everlasting grace. [Chorus] He calls you tenderly to come, Into the light where you belong. In Jesus, find your song, He waits with open arms, so strong.', '{faith,caryn}', 5),
  ('design', 'Design', 'Without being taught to design,
I started designing.
My designer friend despised my work.
Without being taught to write,
I started writing.
My writer friend hated my work.
Later in life, I see the truth.
They hate how I made the money 
They spent for College
Seem worthless.', '{}', 6),
  ('dreams', 'Dreams', 'Dreams are born in those moments
When the mind opens itself
And with the heart as its center
The imprint of the vision blooms
With the pedals of thought exposing
The anther of our hearts
revealing sweet pollen of hope and vision
Delicate filaments that extend themselves,
To the chance exposure of the
Imprinting instance
Where we see our calling
Where we fall in love
Where we see the self complete
Dreams are carried through
And nurtured within the safekeeping
Of gardens carved on terraces
Inside the chasm of the soul
In places we guard zealously
With the elastic strength of
Labirynthic walls and delicately
Crafted masks, constructed
To deflect the passing glimpses
Of occasional lovers and
Misplaced passions
Dreams are fulfilled
In pieces, much of the time
Revealing themselves
As fractions, making the whole
Sometimes unnoticeable
A mysterious construction
That harvests the ripened blooms
Within our inner crevices
Deliberately, almost secretly
Dreams are sometimes destroyed
By wind whipping through the cavernous
Coils of thought and emotion
Cold wind of disappointment
Arctic storms carrying the whispers
Of lies, deceit, and carelessly spoken words
Understood by our inner gardens as deep truths
Understood as richening soil for dream roses and rhododendrons
That soon after wither and die
Sometimes the pedals fall, ashes
To give sustenance to a hybrid dream
Wiser, stronger and with thorns
Sometimes remains of frigid breezes
Carry them off to unspoken places
Places where denial sinks a landscape
Into dark valleys
And no seed or remnant escapes
Dreams are not captive to the ruminations
Of one’s own personal geography
Daily depending on strong soil of good life
circumstances
To survive the days
Instead, dreams arise in the strangest
Of places, giving birth in numbers to those
Who are strong enough to open themselves
To the promise, the beauty of the moment,
The imprinting instance of chance and melody
The meekest, the poorest
Can carry the deepest gardens
Allowing delicate openings
The poverty of an anther’s exposure.', '{memoir,caryn,aging}', 7),
  ('dreams-arise-in-the-strangest-of-places', 'Dreams Arise In the Strangest of Places', 'Dreams are born in those moments
When the mind seems to open itself
And with the heart as its center
The imprint of the vision blooms

Dreams arise in the strangest of places
Where we see our calling
Where we fall in love
And no seed or remnant escapes

Dreams are fulfilled in pieces
Occasional lovers, misplaced passions
Lies, deceit and carelessly spoken words
Sometimes the petals fall

Dreams are carried through and nurtured
within the safekeeping of ashes
Wiser, stronger and with thorns
Where denial sinks a landscape into dark valleys
Sometimes the petals fall', '{caryn,heritage}', 8),
  ('explosions-gunshots', 'Explosions, Gunshots', 'Explosions, gunshots—  
the lullabies of my Peruvian dusk,  
louder than crickets,  
brighter than lightning bugs  
trapped in jars I never owned.

Dead bodies sprawled like lost kites,  
Army trucks like slow, rusted dinosaurs.  
These were my caution signs,  
my teenage days whispered  
through cracked transistor radios.

Wild dunes and beaches:  
our godless cathedrals of play.  
Sand was currency,  
broken shells were shivs,  
and the tide took our secrets  
without apology.

Jesus, his beard neat and sad,  
stood beside terrorism on the TV,  
both equally distant,  
both equally spoken of  
with the reverence reserved  
for El Niño or El Comandante.

Prep school uniforms,  
Gray and white nooses in summer, 
Deep slums with love and guinea pigs 
and boys who ran faster than fear.  
Those were my coordinates.  
My moral compass spun.', '{peru,faith,memoir,caryn,aging}', 9),
  ('fog', 'Fog', 'This thick fog lays out its gaseous tendrils, 
and nothing is to be seen clearly, 
not even yourself.

Wading through such blindness 
wears you so thin, 
you feel the exhaustion 
in your moist brows, 
but you continue to search for vision 
because you know it''s all you have left.

So you twist and you turn, 
a silent dance of desperation 
with this deafening mist. 
At least that which embraces you 
in its thick blanket of nothingness 
keeps you warm 
with its wisps of heavy moisture....

Condensation derived 
from chaos... 
but it makes sense to you - 
it stands in your way, 
it envelopes you in nothingness 
it bars you from your own meaning.

Outside, all of it seems so random, 
so full of nothing 
but the fog comes up against you and leaves you 
falling, tripping on unseen crevices. 
In your heart it all seems so contrived... 
Fate, hiding its consciousness in the mist of circumstance, 
has pitted its greatest minions against you, 
and to struggle against this mantle is to create more 
delusion through your sweat.

Still you struggle, still you sweat, 
because you know vision lies outside of circumstance, 
and to let the mist control you would lead to a walk 
that falls upon itself... 
so you strive for something you know is true, 
yet you''re not sure what this vision will be 
when you find it, 
but you know the weight of meaning 
is lighter than the 
weightlessness 
of being lost in the fog.', '{}', 10),
  ('forgive', 'Forgive', '1I forgave him a long time ago.
I confronted him when I was 19.
Because I wanted forgiveness to mean
Reconciliation.
He never said sorry.
He blamed me for being selfish.  
Self-absorbed.
So, I took the only path left for me.
To walk to the middle of our bridge alone.
And leave the single olive branch there.

I didn’t go see him as he died.
There was nothing to say.
He was gone most of my life.
I loved my time without him,
Because he was a monster when he was present.
I honored his death.
I stood proud as I pretended one last time.
To honor a man as he would have wanted
To be remembered.
And suffer, one last time 
The weight of pretending.', '{caryn}', 11),
  ('grind', 'Grind', 'More than 30 years of the corporate grind.
I was ready for it though.
We’d learned to fake it already when we were young.
Missionary Kids learn early that
The family can’t be open or transparent.
Mom and dad’s success depends on us
Perfecting the performative art of a happy family.
I go to work with my church face.
Capable, confident, collaborative
full of constructive candor.
I get sick of it sometimes.
Carrying out bad executive decisions.
Focusing on preserving misperceptions.
But there’s no one to hit me when she’s not watching.
I traded in one broken family for another.', '{faith,aging}', 12),
  ('growing-apart', 'Growing Apart', 'We were young once.  
Not just in age,  
but in the way we believed  
that nights could last forever  
if the music kept playing.

“Blue Monday” shook the floor.  
We didn’t talk much then—  
just moved,  
motion like energy exchanged,  
our bodies fluent in something  
we didn’t yet know would fade.

Later, “Cuts You Up” came on,  
and it did.  
But not the way we thought.  
Not the drama of heartbreak—  
just the slow erosion  
of knowing someone so well  
you stop looking.

Time does that.  
You wake one day  
on opposite shores,  
waving across a distance  
neither of you meant to make.

And still—  
somewhere in a grocery store,  
Camouflage’s “That Smiling Face" plays  
on a speaker no one notices.  
And I pause.  
Just long enough  
to feel the light from back then.  
Brief.  
Undeniable.

We do not curse the fading.  
That’s not the kind of love we had.  
But we do carry  
the ache of the echo.  
We are the ones  
who remember the song  
after the room has emptied.', '{caryn,aging}', 13),
  ('he-arrives', 'He Arrives', 'He arrives back after being gone
Somewhere in the Peruvian jungle
Half-adventurer, Half-preacher

Zero left for father

My saving grace

He dives into the freezer
His personal stash of M&Ms
He rages in the kitchen
Blaming the nearest person
Of stealing from his stash

“Did you steal my M&M’s?!?!”
A child of seven whimpers truthfully, “No...”
“I can’t hear you!  Did you steal my M&M’s?!?”
He’s a man of god - maybe god is mad at me?
“No...”
“I don’t believe you!  Did you steal my M&M’s?!?”
Maybe...maybe he’s right...
Maybe I forgot, or in my sleep...
Desperate to make him stop before hitting me...
“I don’t know...”

He takes the class ring, turns the sharp gem
To the inside of his palm
And forcefully brings down his palm on my head
Just enough to bruise
Just enough not to bleed

Instant pain, but I can leave.

The decades go by, and I still struggle 
To defend myself, when I know I’m right

It feels like it’s best to take the blame
To make the pain go away.', '{peru,faith,memoir,aging}', 14),
  ('i-ll-be-your-villain', 'I''ll be your villain', 'I was the one who didn’t kneel.
Even as a boy, I stood at the doorframe
like a nail the hammer missed.

He roared like something ancient,
but I learned the silence louder than he ever was.

They became small for survival.
She disappeared into the wallpaper
and lived there for years.
  
I was not brave.
I simply refused to vanish.
That was my sin.

At the wake,
I wore the old mask,
the one with the eyes carved soft.
They needed the lost one returned.
So I came back
wearing a version of myself
they could forgive.

I told the story the way they wanted it.
His charisma, not his rage.
His heart, not his unpredictability.
I told it kindly,
for their sake.

She needed a version of him
she could grow old beside.
So I left the truth
in the coatroom
with my grief.

Now they carry peace in shallow bowls.
It is enough for them.
I have made it so.

I live apart,
a sort of exile.
The one who did not forget.
The one who could not heal

if healing meant pretending.

Still—
I polish the lie like silver
so they can eat off it.
I will be your villain.
I will keep the light dim
so you can sleep.

This, too,
is love.', '{memoir,caryn,aging}', 15),
  ('in-your-arms', 'In Your Arms', 'When the world turns, and shadows fall, When the weight of the world feels too tall, I witness the pain, the cruelty, the scars, Yet there’s a refuge beneath the stars. In the arms of Jesus, I find my rest, He loves me through trials, I’m truly blessed. No matter the storm, He’s my guiding light, In His embrace, everything feels right. There’s a haven, a sanctuary found, Where my soul finds peace, my heart unbound. He soothesmy fears, He mends my soul, In Your arms, my spirit feels whole. No judgment there, only endless grace, In His presence, I find my place. There’s one place that’s always safe, In Your arms, I find my saving faith. [Bridge] Though my journey is long, and the road often bends, His love is eternal, a love that never ends. Through valleys low and mountains high, In His arms, I’m taught to fly. [Chorus] In the arms of Jesus, hope never departs, He holds me close, heals my broken heart, No darkness too deep, no battle too great, In Your arms, Lord, You are never late. [Bridge] He whispers truths, profound and clear, In His presence, there’s nothing to fear. He’s my rock, my fortress, my king, In Jesus’ arms, my soul can sing.

Link to tracks on major platforms here.', '{faith,caryn,aging}', 16),
  ('kabala-meets-16th-century-spanish', 'Kabala meets 16th Century Spanish', 'Keter – The Crown / The Inheritance of Silence

Dijeronme ke la fe sería mi ancla.

Baruj HaShem, dijieron, komo si el peso fuera promesa.

La luz en la frente, el deber en los talones,

una cadena dulcemente envuelta en oración.

Pero aprendí, kon suspiros y sombras sin nombre,

Has ve’Shalom, ke algunas anklas no están echas de hierro,

sino de manos ke parezen karisias,

pero te empujan abaxo kuando el alma empiesa a subir.

Kuando alzas la kara al shamayim,

i sientes la respuesta detrás del velo,

te akusan de romper lo sagrado.

El raḥum veḥanun, yo nunka rompí sus orasiones,

pero no supe yorar kon ellas sin mentirme.

⸻

Tiferet – The Heart / The Refusal to Be Contained

Ay orasyones ke se sienten komo bardas.

Rak sheket… rak sheket…

Ay amores ke demandan silensyo,

ke solo valen si tú no dezis ni una.

Lo aleinu.

Ansí ando yo.

No por estar perdido,

sino porke el aire afuera del relato

es más puro—más emet, más ruaḥ.

Yo no soy el personaje ke pintaron,

ni el hijo ke kayeron en los libros.

Mi neshamá no se firma en el margen.

⸻

Malkhut – The Dust / The Chosen Among the Exiled

I si so eskogido,

chas veShalom, ke no sea por torres ni títulos,

ni por siluetas en vitrales olvidados.

Sino por el kamino de polvo,

kon los exilados i los exkomulgados,

debaxo del silensyo de la atardesida.

A la par de las almas ke florezen

en las fendas del kuento ofisyal.

Amen ve’Amen.

Amen ve’Amen.

Amen… (pause)

ve’Amen.', '{faith,aging}', 17),
  ('laugh', 'Laugh', 'I laugh at very serious occasions.
It’s not something I can control.
It just happens.
I grew without a chance to be a child.
At 57, maybe I still want that chance.', '{memoir}', 18),
  ('maybe-it-s-all-my-fault', 'Maybe It''s All My Fault', '“Maybe it was all my fault”, the child in me whimpers
“Maybe I’m a bad person” 

The shame talks to me most of the time
Telling me to bury the bones
And hide the remains of these stories

The party at Vivian’s.  I was 16, and rarely
Got to attend friends parties.  Ironic, as the least trusted of the kids.
The lack of trust didn’t come from having deserved 
It.  I just didn’t play the charm games.  My father knew I didn’t like him, my mother was too guilt-ridden to understand.

Masahiko’s dad was late.  He was supposed to take me home.  I was a good kid.  I called home, already swallowing the doomed feeling. “Masahiko’s dad is late...” 

Three more hours, three more calls.

I could hear my dad shaking with rage as the phone knocked on his large bracelet.  His screams, heard by Vivian’s parents.

“Where are you, I’ll pick you up, and I’ll have to be late for my sermon tomorrow!”

The next 30 minutes were familiar to me.  I sat alone, while my friends laughed and danced behind me, trying to triage the incoming inevitability.  My father would be enraged, physically, verbally, emotionally.

But, like so many times in the life of our family, we’d learned to cover for him, hide the demon inside, cover the bruises, re-package the stories.

“He may come in the house, even though I haven’t had any alcohol, I will act drunk, so it will look like he has a reason to act the way he will...”

Making excuses for him was the family’s job.  Not just because we feared him.  But because we knew our mother depended on us hiding it - it was our lie, our shame, our sacrifice, so that he could save souls.

He arrived, the suburban screeched and stopped.  Honking the horn without stopping, I knew it was time.  Ironically, Masahiko’s dad pulled up behind him.

I got in the passenger seat, tense, and strangely ready for what would come next.  He liked to use his class ring.  Unlike other class rings, his had a crystal that pointed out, like a ruby pyramid.  With the door still open, and friends in the courtyard, my father lunged at me with a series of fist punches, ring forward.  With his foot on the accelerator and break, the Suburban lurched backwards and forwards, granting me a moment in which his own punches landed on my shoulders and the back of my chair.

Enraged, as I knew he would be, I did my best to close the car door, even as I was being pummeled.  I could sense his attempts to connect with my face.  But even so, my primary instinct was to save him, save us from embarrassment.  

He finally connected, slicing my forehead open, and finally, the quiet drive back home began.  I put my blazer up to my head, leaning my head down, to stop the bleeding.
We arrived home, and I quickly moved to the bathroom to clean up the cut.  I placed some gauze on it, and went to sleep.

I woke the next morning, and sat with my mother for breakfast.  As she began to ask me about the bandage, my father sat down beside us.  

My father answered for me 

“He fell at the party.”  

He answered my mother, looking at me with a half-smile.  

It was never brought up again.  

In my silence, I protected myself, and my mother, from a broken man.', '{peru,memoir,aging}', 19),
  ('men-s-room-sonata-in-tiled-minor', 'Men''s Room Sonata in Tiled Minor', 'The men’s bathroom:

a chapel of porcelain and piss-rules.

Seven urinals.

I take my place...alpha, omega, or the divine center—

leaving sacred gaps for the next

pilgrim of the stream.

I begin.

Soft drizzle. Modest patter.

Then he enters:

Protocol-breacher.

Borderless barbarian.

He chooses the urinal beside me.

He chooses.

And like the Hoover Dam unleashing

all of Manifest Destiny at once,

his stream announces itself,

confident, continental.

While mine

trickles like regret.

I push.

Oh God, I push.

The bladder, it seems,

is also subject to shame.

I finish, wash,

press my palm against the great equalizer:

the moist steel handle of collective hygiene.

There is no foot lever.

No escape.

Only sacrifice.

Later, stall time.

Communion.

A little sanctuary to scroll, to void,

to wonder why the waxy halo of the seat cover

never, not once, behaves.

Its middle tears pre-emptively,

slides off like a jilted lover.

I make do. Sit. Sigh.

Four open stalls.

He comes again.

Sits beside mine.

Speakerphone on.

Wife’s voice bouncing off tile.

He talks of cruise ships while his own departs,

loud, aqueous,

and I, caught mid-tension,

hold back,

fearing to betray the code

by disrupting his lie.

He lies to her.

But I won''t lie to the unwritten law of men:

We shit in silence.

The toilet paper roll mocks me.

Engineered to fail,

it taunts with microscopic ply,

ripping like dreams on waking.

I lean, tug, it jerks,

releases with a banshee scream.

Paper sails into the air like ticker-tape

for a championship no one wanted.

He squirms.

I am the noise now.

I am the breach.

I wipe. I rise. I flush.

The water rises too.

Not like redemption.

Like flood.

It keeps rising.

Over porcelain.

Over tile.

Over shoe.

It runs like guilt.

Into his stall.

His cruise ends.

His wife is gone.

He asks, “What the hell?”

I do not answer.

I am already gone.

Shoes squishing out the door.

No hand dryer.

Only memory.

And shame.', '{faith,memoir,caryn,aging}', 20),
  ('miguel-dasso', 'Miguel Dasso', 'Avenida Miguel Dasso. San Isidro.
Beta Video Club.

At the corner of Avenida Miguel Dasso
was a restaurant we never entered.
Curtains always drawn.
A man always standing outside.
He didn’t seem to be working.
He didn’t seem to be leaving.

Further up the street,
on the left side,
before the park,
the Beta shop.

(They say VHS beat beta
because of porn. I didn''t
care.
Betas were
better.
And I was too young to
know how porn helped
video tapes.)

No sign.
Just a door.
Inside, original Beta tapes
in their stiff plastic cases.
Handwritten titles.
Soft-spoken ink.
A kind of reverence,
even for Blade Runner (Versión original).

We rented two.
Always two.
Never three.

One would eat itself.
One would make sense.
That was enough.

The stall was quiet. Small.
A wall of betas.
Someone in between them and a counter.
Then me.

Outside, the street moved:
buses, shoe shiners,
a woman selling lúcuma ice cream
in a metal tray under glass.

Butifarra on wax paper
from the stall down the block.
Jamón del país,
onions in lime,
bread that disintegrated in your hands.
A taste of pork and heaven.

The Baños Turcos Windsor
always fogged, always quiet.
Men came out softer than when they entered.
Towels tucked like regrets.
And then home.

To the den,
where the Beta machine groaned to life
on a low table with missing corners.

On the window
a crooked “United States Marine Corps – Semper Fi” sticker
that had nothing to do with anything.
No one ever removed it.
We had a suspect.
We never spoke of him.

The screen flickered.
The tracking drifted.
The voices lagged behind the lips
but still made sense somehow.

And when it ended,
the tape sat warm in my lap.
The label curling at the edges.

Still legible:
Avenida Miguel Dasso. San Isidro.
Beta Video Club.', '{peru,memoir}', 21),
  ('one-night', 'One Night', 'One night, after wine and Turkish coffee,
I asked my immigrant friends why they came here.

They said - - -

We came because silence in our homeland
was not peace, but the echo of boots.
Because our names were called last,
or never. Because truth
was a locked room,
and fear its doorman.

We came from cities
where your vote bought nothing
but suspicion,
where the policeman knew your daughter’s name
and not from kindness.

We came from markets
where bread cost a week’s sweat,
from nights lit by generators,
not stars.

Where neighbors disappeared,
and no one knocked.
We fled uniforms without faces,
laws without reason,
churches burned for speaking the wrong prayer.

We left behind the kiss of corruption
and the grip of inherited sorrow.

Here, the air tastes different.
Here, a stranger might help.
Here, you can say the president is wrong
and not wake in a cell.

We came not for riches,
but for a name on a lease.
A birthday cake in a quiet kitchen.
A future unmarked by the past.
A dog that doesn’t bark
at midnight raids.

We came to stand in lines
where everyone waits
the same.
To work three jobs,
and still smile
at the sound of our children
learning a new word:
safe.

This place is not perfect.
But it lets us breathe
with both lungs.

Lets us love
without apology.

And sometimes,
when no one’s watching,
we weep
for what we lost.
And then
for what we found.', '{faith,caryn,aging}', 22),
  ('peru', 'Perú', 'Sometimes I think Peru lives in me more as a mystery than a memory.

I haven’t gone back in a while (1997), and I don’t call or write the people who formed me. Fredi was my second mother in many ways, and I let that relationship drift into silence. Never just an ‘empleada’ to me. I don’t avoid it, yet I’ve never been sure how to step into it again. There is a whole country in me that feels sealed behind a door I’ve never fully opened.

Chiclayo is the part of Peru that feels closest to my bones. Rough, joyful, sunlit, and wild. I was fully alive there. I felt connected to the dirt, the streets, the friends, the easy freedom that shaped my childhood. It was all movement and noise and laughter and bruises that healed by morning.

Lima was something else entirely. When we moved there I didn’t understand myself at all. After years of correspondence school I was suddenly placed in real classrooms, surrounded by kids who knew the rhythms of social life. I walked in without the codes. I felt rejected and confused. I remember standing there, chalk dust in the air, wondering why my chest felt tight every morning. It was a taste of being one child among many, and it unsettled me. I’d experienced this the two previous year during my father’s leave of absence, in two separate public schools. Disorientation.

At the same time, those years gave me moments of self-discovery that still follow me. Field hockey filled my afternoons. Friends began to appear in my life with their own weight and texture. The city itself was tense during the final phase of Sendero Luminoso. Even as a kid I felt the electricity of danger humming under the surface. It taught me to sense the world rather than assume it.

The contrasts were constant. Weeks in the opulence of Monterrico at Roosevelt School. Weekends in the slums where my parents worked. I lived between two realities without understanding how unusual that was. Peru taught me that beauty and suffering often exist within the same geography, sometimes only a few minutes apart.

Reading became a rope I could hold while everything shifted around me. Frank Herbert, Larry Niven, Poul Anderson. Their worlds gave me language for ideas I didn’t yet know how to speak. A small devotional book called Leaves of Gold steadied me when I felt unanchored. Music filled in the blanks. The Cure. New Wave. Even Christian New Wave. They sounded like the inside of my mind.

I also remember meeting Siddhartha, a Sikh friend who talked about his faith in a way that didn’t threaten mine. It opened something quiet in me. It showed me that God’s light does not always arrive in familiar colors.

Team sports helped me belong to my own body. They gave shape to my days. They taught me how to carry myself in a crowd.

When I look back at Peru now, I feel something that isn’t nostalgia. It’s not longing either. It’s a kind of untouched mystery. A country I carry inside me that I have never tried to map. So many contrasts. So many doors. So many versions of myself left suspended in time. I didn’t push Peru away. I simply never learned how to hold all of it at once.

Maybe one day I’ll open that door and see what waits there. For now, Peru remains a quiet river beneath the surface, shaping my life in ways I still don’t fully understand.', '{peru,faith,memoir,aging}', 23),
  ('push', 'Push', 'I know I pushed you away last night, writing
You things that were unkind, after an intimate night
Spent over cocktails and dinner.

I wonder if I’m more comfortable living
A life without you, but yearning your presence,
Than a life with you, where we might grow
Close, and you might see all of me.

Maybe I prefer to crave the beautiful memory
Of what was, than risk a present and future
Where we fall apart because I was not the right 
One for you.

I think I wrote those words because I love you
Too much to think of you as a closed chapter in
Our lives.  

I love you so much, that I’d rather have us be a
Broken pen, and torn paper - an unfinished ode to
A love that could have been so many things.', '{memoir,caryn}', 24),
  ('simpler-in-lima', 'Simpler in Lima', 'In Lima, we learned to flinch young.
When soldiers passed, we turned our faces
to the Pizza Parlor in Miraflores.
We focused on Pepperoni and Mushrooms,
avoiding eye-contact and spent ammunition.

When they took Luis, we were silent.
No one told us to be. We just were.
When he came back. He wasn''t the same.
We understood.

At School, Pedro sighed -
graduation postponed, again.
Another bomb threat.

When the city of 7 million went black, it wasn’t news.
You sat still, like a prayer waiting for its god
to forget.

When death threats came,
you didn’t tell your friends. You sat
and watched another movie,
eyes fixed on the screen.

Alert, but pretending it was normal.

Ricardo made jokes.
It was funny.
There was no other
way to see it.

There were

but dark humor cut the
insanity into smaller,
more edible chunks.

When we saw the bank blow up,
we turned to walk slowly, back towards
San Isidro.

We were quiet.
Avoiding sirens,
Hiding from the army trucks.

Closer to home, we laughed.
It was a fragile sound,
full of anxious release.

Another night in Lima,
another night of absurd living.

At twenty-one, in Alabama, the cop pulled me over.
My voice cracked like dry maize.
I handed him my passport.
He laughed. I laughed. It wasn’t funny.
Casually, I watched his partner''s finger
on the safety.

Old habits die hard.

The shrapnel still in my calf pulsated
As he said ''Be safe now''
and left me alone
without asking for a bribe.

The gas station pump asked me a question
I didn’t understand. I stared at it
like a wounded man
back in Lima
waiting for the Senderistas to pass.

At the grocery store, 32 kinds of cereal.
Where is the safety in choice?

In Peru, violence had a way of behaving.
You suspected who carried the guns.
You knew not to speak English
on the wrong street. You knew
what silence bought you.

In America, the rules are airless.
The violence wears khakis
and asks how your day’s going.

The disappearance happens in slow scrolls:
in the job interview,
in the look on her face when I said
I’d never had a checking account.

I miss the clarity of Lima’s dusk.
The barking of dogs before a bombing.
The way danger felt honest.

Here, I don''t know where the guns are.
Or the gods.

No one warns you
about the hidden threats
in America.

One day you wake
and realize no one is missing.

That’s how it starts.
The war here is memory.
And the time and space to forget, then remember.', '{peru,faith,memoir,caryn,aging}', 25),
  ('sunday', 'Sunday', 'There were years I ran from it.
Ritual.
Our childhood faith.
Those metal folding chairs.
Those fragile card tables pulled out for potluck.
The old grammar of grace.

I ran from it.

I needed my own blood,
not the kind dripped in grape juice
or broken in pieces of Wonder Bread.

But.

Something remains in my heart,
soft as the echo of an out-of-tune piano
in an empty sanctuary.

The hymnals had a smell,
like dust and linen,
like your favorite grandmother’s lap.
Even the pews creaked like they were tired of kneeling.

The older women touched my cheek
with hands soft from years of service,
smelling faintly of rose water and Sunday kitchens.
They called me sweetheart
the way one might hum a hymn without thinking—
a gentle note in the liturgy of love.
"Let me hug your neck..."

We pulled into gravel parking lots
where the grass had just been cut,
a smell that meant someone cared
enough to prepare a place for the invisible.

I watched the deacons
shift in their suits when my father kept preaching,
like time had betrayed them
for something holier.
I loved it.
How he kept going past kickoff time.
Like maybe God had one more thing to say
and wasn’t done yet.
"Let''s sing the last stanza of ''Just as I am'' for an 8th time''...."

My mother’s voice,
still in conversation
with a circle of women who knew the words
to every casserole prayer.

Inside the church,
the air buzzed with theology.
Outside, cicadas.
And somewhere in the droning,
of sermon, of fan, of heat,

I stopped understanding the words
and started to feel peace.
Not belief. Not doctrine.
But peace.

A different kind of communion.
Like the hush of Sunday afternoons
between services,
when time folds
like linen after The Lord''s Supper,
and everything rests.

Older now
I don’t miss the creed, the dogma
but the choreography:
the folding of bulletins,
the way we bowed our heads like the grass
after rain.

Not the liturgy,
but what we made for it...
the small, stubborn rituals
that built a kind of love
out of repetition and heat.', '{faith,memoir,caryn,aging}', 26),
  ('sympathy', 'Sympathy', 'Sympathy shatters me for some reason
I can’t receive it
And if I let it in, I can’t stop weeping
The tears roll slowly
And I hate myself for being so weak

I don’t feel like I deserve good things
Unless I’ve suffered for them
Unless there’s been a price I’ve paid

I think I’m getting better at this
After years of inner work

I built an AI podcast last week
The AI voices - I trained them to discuss
My memoir.
The female voice used a deeply sympathetic tone
To a random part of my story.

A sat in the car, quietly weeping with gratitude
At a sympathetic voice I could accept.', '{memoir,aging}', 27),
  ('the-class-ring', 'The Class Ring', 'The Man of God hits him.
Not a tap, not a correction.
The fist closes, the face contorts.

The ring tears, a small piece of him
lifted away with the blow. He speaks
of love, of sacrifice. But the boy sees
only the rage, a storm behind his eyes.

Does God hate him? The question hangs,
a dark cloud in the small room.
Or is it just this man, this father,
who mistakes power for love,
who uses God like a weapon?

God loves us all, he says, even him.
But the boy knows a different God.
A God of whispers, of gentle touch.
A God who needs no violence
to claim his own.

His God, the boy thinks,
would never hit a child like that.', '{faith,memoir,caryn,aging}', 28),
  ('the-funeral', 'The Funeral', 'I got back from the funeral, still trying to
Figure out how I should feel.  I never cared for
Him much.  Cold and mean-spirited when present
In private, warm and charismatic when present
In public.  I liked him best when he was absent,
And the world was mine to explore.  

Extended family came over.  We were all sitting.
My older brother, my mother’s surrogate husband,
The bearer of the family lie, vowed to keep the lie alive. He said “My father’s greatest
Sin was loving us too much...”

I excused myself quietly.  I lit my pipe, and took
A long and slow breath.  It was a perfect lie,
But it was the right lie to tell. We were all there,
Partly relieved he was gone... but now it was time
To do the right thing - to lie again, and to honor a man
Not as who he really was, 
But as how he would have wanted to be remembered.', '{memoir,aging}', 29),
  ('the-piano', 'The Piano', 'There was a piano wherever we went. Remember? It was weathered by travel, tuned by the bumps of roads and cargo. There was this gently bruised  melody in those many places we called home. And some nights, when dad travelled to churches, mom would play at home.
The sounds, the labored repetition of practice - sometimes hammered, sometimes caressed notes, played by a mind full of thoughts and worries.
On other nights, two sets of hands would play, My mother and brother, carving unison out of an old piano.
Other nights, when my younger brother and I would be at home, mother would play the piano by our father at church.
Our second-mother, maid, ‘empleada’, would sit to play and practice
The most fragile tone of all. A gently overzealous tempo.
My younger brother and I would run by the piano, and in our parentless paradise We would dance around her and pounce on notes, pushing her concentration, playfully wondering where her limits were.  
Her mission, with an effervescent smile, was to defy chaos.  There would be other times when, while everyone was gone, I would sit on the piano bench.
The wood pieces greeting each other under my weight, creaking a welcome sound through travel-weary wood.
I would sit and play one minor note.  That sound traveled to deep places.  There the note would rest, and comfort the yearning for the familiar.
I know you did the same, in your own way. Finding small tokens of comfort throughout the day, that would root the transient in you.
That melody was a part of home.  This piano and its old notes, sweet melancholic constant in our family.
Home had the unlikeliest keys.  There was a piano, and its notes were constant.  In places that changed so often, the notes remained the same.
Those notes still ring in my head when I''m at the cusp of sleep.  In those ebonies - those minor keys I loved so much, I can hear the whisper,  "I love you.  You''re Home."', '{peru,faith,memoir,caryn,aging}', 30),
  ('the-road-taken', 'The Road Taken', 'I’ve walked life like a long, broken road,
each step pressing into earth that changes beneath me.
In Peru, the sun rose over high desert dunes,
casting long shadows over my childhood,
and glistening in volcanic color, shining
through threads of memory.
I chased the wailing wind through dusty streets,
my boots clapping a rhythm on cracked adobe,
freedom ringing in the laughter of children
who knew the secret language of play.

In Scotland, the heather bruised the hills
with purple, and the sea thundered
against black cliffs. I let the wind carve its name
into my skin, and found comfort
in the weight of its solitude.
There I learned the art of being alone,
how solitude can be a friend,
its presence soft as a shadow.

In Budapest, the rain polished the cobblestones,
and neon lights from old signs
spilled into the streets.
I walked those wet avenues,
watching how the city painted itself in puddles,
how the world reflected—
soft, blurred,
and achingly beautiful.
I’ve seen those same reflections
all over the world,
from London’s damp alleys
to Peru’s highland towns.

The rain, it seems, speaks
the same language everywhere.

Texas sprawled wide and hot,
where mesquite trees stood like sentinels,
and wildflowers burned in the ditches.
There were days when the road stretched forever,
a shimmering mirage on the horizon,
and nights when the cicadas sang
the world into stillness.

I’ve stood before art,
letting its silent truths shape me.
Henry Moore’s Recumbent Figure,
its curves and voids, taught me
the elegance of stillness,
how absence and presence
complete one another.

I’ve danced in dark places,
where shadows pulsed to the rhythm
of bass lines and whispered secrets.
There is a sensual darkness in movement,
a communion of bodies and breath,
where the world disappears,
and only the music remains.

Furniture''s song ''Brilliant Mind''
Book of Love''s ''lullaby
Camouflage''s ''That Smiling Face''
Wolfsheim''s ''Once in a Lifetime''
The Cure''s ''Love Song''

They once poured through my veins,
melancholy a mirror to my own,
their beauty a healing balm.

I have loved and lost,
traced the gentle hills of a lover’s collarbone,
and found solace in the heat of her skin.
But I’ve learned, too,
that love isn’t possession.
You can’t push people away,
or pull them closer
than their own hearts allow.
You must let them walk their own roads,
find the same love you carry for them,
or not at all.

And I’ve been brought low,
stood exposed in the cruel light of public failure.
Once, words like stones rained down,
judgments hurled without mercy.
I felt my knees buckle beneath the weight,
my face hot with shame.
But even in those moments,
the earth did not swallow me whole,
and I learned to rise,
to wear my scars as armor,
to find dignity not in perfection,
but in the grace of enduring.

I’ve wrestled with truth,
its jagged edges cutting into my soul.
There is a spiritual light,
distant but persistent,
a beacon in my darkest hours.
And yet, I have often sought solace
in the shadows, where questions
linger longer than answers,
and the quiet hum of uncertainty
feels like home.

The ocean has held me in its wild embrace,
tossed me like a leaf in the wind.
Once, under a vast Pacific sky,
I let go,
surrendered to the rush of saltwater,
to the chaos and the calm.
In that moment, I found peace,
a freedom deeper than fear.

I’ve been a father,
held my child like a fragile bloom,
marveled at the way life begins anew.
No better teacher, than my son, to 
teach me the silent lessons,
to step back, and learn to be the outer ring of someone else''s orbit.  
To bask in the joy of orbiting the bright,
shining life of a Nova, a new star.

And I’ve fallen in the ruins of divorce,
sorting through the wreckage,
learning how love, even broken,
can still grow.

Friends have walked beside me,
some falling away like leaves in autumn,
their absence a quiet echo.
But their memory roots itself deep,
a forest I carry within.

I’ve looked to the stars,
seeking answers in their ancient light,
and found instead a quiet awe,
a reminder that some truths
are too vast to hold.

This road, long and winding,
has been marked by triumph and regret,
Lit by the light of distant stars
Bearing the weight of my own shadow.
And though my feet are weary,
I walk on,
each step a testament to a life well lived.

A tired smile.  A contented heart.  A long yawn.  And a whispered tune.', '{peru,faith,memoir,caryn,aging}', 31),
  ('they-say', 'They say', 'They say the Bible is old, not relevant now they try to sway you, break the sacred vow They tell you to nurture pain, hold it near, they say anything to keep you small They claim victimhood as the new crown, “make it shine” They say it’s strength in weakness, a subtle design Forget the ancient paths that guide and heal Replace them with stories where suffering’s wound is who you are For the Bible bears healing, leading to love Through Christ’s compassion, sent from above [Bridge] In the silence of prayer, feel the grace unfold Let whispers of truth banish lies you’ve been told The light shines in darkness, guiding your way Embrace the promise, let faith never sway [Chorus] Love is patient, love is kind It transforms the heart and mind No envy, no pride, it holds Together, through the storms it molds Love protects, trusts, hopes, preserves A devotion that never swerves Love, the everlasting flame The greatest word, forever the same Let Jesus heal you, stop holding on Your pain served a purpose, to heal with the scar that gives you compassion and wisdom Now move to the light because [Chorus] Love is patient, love is kind It transforms the heart and mind No envy, no pride, it holds Together, through the storms it molds Love protects, trusts, hopes, preserves A devotion that never swerves Love, the everlasting flame The greatest word, forever the same Find the links to the track here', '{faith,caryn,aging}', 32),
  ('to-be-this-old', 'To be this old', 'To be this old, you see
I don''t feel it, or at least this is what I tell myself
In the mornings when my heel cramps
In the noon hour, as I struggle to stay awake
In the evening, when my back begins to give
To be this old, you see
I don''t think it, or at least this is what I tell myself

When I can remember friends from 50 years ago
When the song I hear at Costco was my teen ''fuck you'' song
When I find myself alone, with friends having passed on
To be this old, you see
I don''t sense it, or at least this is what I tell myself

Straining to see the print on the paper
(I turn my iPhone camera on in the elegant restaurant, sheepishly, just to see the sides available tonight)
Struggling to ignore how gravity makes itself known
Wondering how best to be useful always
to avoid being thrown away in a nursing home
to know when to end a beautiful life with dignity
before it comes to that
"Put me in a wheelchair and toss me over the side of an 80''s party ship"

To be this old, you see
I don''t want it, or at least this is what I tell myself
But love has not stopped giving me reasons to feel young
Wonder still takes my breath away
Joy still catches me at the least expected moments

To be this old, you see
Isn''t at all what I thought it would be
Neither was love
Neither was wonder
Neither was joy

It was all better, brighter...

To be this old, you see
I don''t want it, or at least this is what I tell myself
But, even with the failing body,
The mind and heart look back,

To a bottle of tequila, well-spent,
To torn clothes in a fit of passion, poetically thrown
To tears of grief and sorrow, given to a woman who I love loving
To dancing in a dark place, wrestling the darkness to light

To be this old, you see
Maybe I do want it, because the road I took to get here
Has a fucking awesome view', '{caryn,aging}', 33),
  ('tribes', 'Tribes', 'I turned away from all the tribes.  
  
The ones with their shiny, plastic smiles,  
the denim-clad pastors, counting sins as if they were coins.  
  
The goth kids with cigarettes and old records,  
curated wounds and pierced tongues.  
  
The new wave kids, all so unique in their irony,  
but dressed so much alike.  
  
Even the theater kids,  
playing roles to escape the dullness of suburbia.  
  
They all wanted me to fit in.  
But I wanted none of it.  
  
On the edges, never at the heart,  
I floated among groups,  
finding comfort where I could,  
in music, in politics, in ideas.  
  
Tradition always felt like a costume,  
stitched together from someone else’s fears.  
  
I ripped it apart at the seams, longing  
for something genuine and raw.  
  
For years, I spoke only to the wind,  
slept beside doubt like an old flame,  
drank clarity from forgotten wells,  
wrote my truths in ashes,  
waiting for inspiration to come.  
  
I worshipped nothing  
only the questions themselves.  
  
No labels would define me.  
Not even God, who I asked to start over.  
  
Yet thoughts form their own tribe,  
wild and restless,  
hungry for stories,  
for connection and warmth.  
  
And me.  
  
I became like Moses,  
carrying rules chiseled from my solitude,  
leading my ghosts  
through the deserts I chose,  
not those handed down to me.  
  
I returned,  
not to blend in,  
but to share what I discovered,  
that every tribe is imperfect,  
but some allow you to kneel  
without feeling chained.  
  
Tradition isn’t a cage  
when you’ve got your own keys.  
  
Now I stand,  
part rebel, part priest,  
hoping to teach my son  
to wander without fear,  
to listen deeply to the intentions  
behind every word spoken.  
And the meaning  
behind every human ritual.', '{faith,aging}', 34),
  ('we-ve-forgotten', 'We''ve Forgotten', 'They bent their backs beneath medieval cathedrals,
that never honored their names.
Paid in bread crusts and silence,
they kissed the hem of priests
who called suffering holy.
They didn''t question.
There was no time.

They walked beside oxen,
grew old at twenty-eight.
Buried children without names.
Worked land they could never own.
Gave thanks anyway.

Because faith was all
they were allowed to keep.

And then,
boats to a strange land.
Names scribbled at port by men
who didn’t care how to spell it.
They became Americans
by surviving the line.

They made cities out of sweat,
lit furnaces, picked tobacco,
opened stores that sold nothing but hope.

They built things.
With hands. With aching backs.
With hymns they translated
into whatever English
they could manage.

We forget them.
Because we don’t kneel
in the dirt anymore.
We forget how a flag
once meant no bishop
and no baron.
Just breath.

We think freedom is comfort.
But it was never that.
It was choosing your own hunger.
It was standing up in a country
that didn’t bow to kings or priests.

They loved this place
not because it was perfect,
but because it didn’t
ask them to be less.

And we...
we''ve forgotten
how heavy that kind of love is.', '{faith,caryn,aging}', 35),
  ('witness', 'Witness', 'I told you about Jesus.  I believed the stories I’d
Grown up with.  He was the path to heaven.  
You were my best friend.  Born a Sikh, you grew up with
Different stories.  I told you about him, and then I
Told you you’d go to Hell without him. Not because I
Was being mean, or manipulative, but because you were
My best friend.  And I wanted good things for you.

You let me finish telling you about Jesus.  You told me
You were a Sikh.  And that you’d die to protect my
Right to believe in a Jesus that would send people to
Hell.

It took me some time to realize that my circle of love
Included you only on condition, while your circle included me, unconditionally.

 told you Jesus, the story I carried like bone.  
You, Sikh, a different song in your blood.  
I said hell, meaning only to save you, clumsy with love.

You listened, then offered your own truth:  
To die for the space where I could believe even this.

Later, the slow burn of knowing:  
My hand open only so far, yours without end.', '{faith,caryn,aging}', 36),
  ('you-ve-been-waiting', 'You''ve Been Waiting', '[Chorus] In the starlight, I find your glow A love that never fades, a heart I know Through shadows and dreams, I return to see You’ve been waiting, always there for me [Verse 1] Like a child, I worshipped you Found truth, beauty, and a friend so true [Verse 2] As I grew, I left you behind Like an old toy, in time so unkind Life turned hard, cold, betrayal’s embrace I danced through nightclubs, in search of grace [Bridge] In neon lights, I sought the thrill But your presence lingered, quietly still I wandered far, in search of your trace The warmth of your love, the peace of your space [Verse 3] But I didn’t realize, I was looking for you Your peace, your love, your certainty held true I come to you now, realizing finally You never left, always waiting patiently [Final Chorus] In the starlight, I find your glow A love that never fades, a heart I know Through shadows and dreams, I return to see You’ve been waiting, always there for me [Verse 4] You let me run to walk in the darkness deep To learn and perceive, your love I keep In the light, I find my way to thee In eternal love, forever to be', '{caryn,aging}', 37)
on conflict (slug) do update set
  title = excluded.title, body = excluded.body,
  themes = excluded.themes, order_index = excluded.order_index;

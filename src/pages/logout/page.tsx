"use client"
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
//import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/router";
import { Fade} from "react-awesome-reveal";
import { supabase } from "../../supabaseConfig";

const Logout: React.FC = () => {
  const [compliment, setCompliment] = useState('');
  //const navigate = useNavigate();
  const router = useRouter();
  async function handleSignOut() {
    await supabase.auth.signOut();

  }
  handleSignOut();

  // Arrays for different types of compliments are defined here
  const jokes = [
    "I've dedicated my life to find my wife's murderer.\nIf you can recommend someone, let me know.",
    "Dating in your 30s is like looking for a parking spot......\nThe good ones are all taken. The rest are either handicapped or too far away.",
    "My therapist told me to write letters to the people you hate and then burn them.\nDid that, but now I don't know what to do with the letters.",
    "My girlfriends birthday is in a week and she said 'Nothing would make me happier than a diamond ring!'\nSo I got her nothing",
    "Wouldn't it have been amazing if John Lennon had invented that device that you put in your front door to secretly see who's on the other side...\nI mean, imagine all the peepholes.",
    "Crocodiles can grow up to 20 feet\nbut most have just four.",
    "I bought a christmas tree today. The guy asked me if I was going to put it up myself.\nI said, 'No, I'll probably put it in the living room'",
    "Orion's Belt is a big waist of space.\nTerrible joke. Only 3 stars.",
    "I won $3 million on the lottery this weekend so I decided to donate a quarter of it to charity.\nNow I have $2,999,999.75.",
    "I got fired on the first day of my new job for asking customers if they would prefer 'Smoking or Non-Smoking.'\nApparently, the correct phrase is, 'Cremation or Burial.'",
    "I told a girl, 'you look great without glasses'\nShe said, 'but I don't wear glasses.' I replied, while polishing my lenses, 'yeah, but I do.'",
    "What did the leper say to the prostitute?\nKeep the tip.",
    "An army captain approaches a prostitute and asks her, 'Would you enjoy my company for $100?'...\nShe looks at the handsome military officer and says, 'Of course, I would be glad!' Captain replies, 'COMPANY! FORWARD!'",
    "If you can make a woman laugh, you're almost there.\nIf you're almost there and then she laughs, that's a different thing.",
    "To the man in the wheelchair that stole my camouflage jacket...\nYou can hide, but you can't run.",
    "I got kicked out of the hospital.\nApparently, the sign 'Stroke patients here' meant something totally different.",
    "A politician is walking down the street when he is suddenly attacked. The assailant says 'Give me all your money'.\nThe politician says 'Do you know who I am? I'm an important government official'. The mugger says 'Fine, give me all my money'",
    "What's the best pick up line at a gay bar?\n'May I push your stool in.'",
    "A bear walks into a bar. He says to the bartender, 'I'll have a............beer.'\nThe bartender responds, 'what's with the big pause?'\nThe bear holds up his arms and says, 'always had 'em.'",
    "Dating women is like squaring numbers\nIf they're under 15, just do them in your head.",
    "I really love playing chess with elderly people in the park.\nIt's just really hard to find thirty two of them willing to do it.",
    "I was watching a film with my little boy earlier. He said, “Dad I'm scared, is that woman going to die?”.\nI said, “Judging on the size of that horse's cock, yes”.",
    "What's the difference between being hungry and being horny?\nWhere you put the cucumber.",
    "Love is like a fart.\nIf you have to force it, it's probably shit.",
    "Today, I asked the hot girl at my gym what her New Year's resolution was.\nShe said 'fuck you'. So I'm pretty excited about 2024.",
    "A pirate captain asks his first mate 'Find out what be the Roman numeral for the two'\n'Aye aye!' responds the first mate",
    "I was at the bank going to withdraw money from my account when the clerk told me I had an outstanding balance\nI told her 'thank you I did gymnastics as a kid'.",
    "I remember my mother telling me, “I have no favorite child.”\nHarsh seeing as I'm an only child.",
    "I began to carry a knife since a robbery attempt a few years ago\nSince then, is being a lot easier to rob people",
    "My girlfriend asked me if I could have a threesome, which of her friends I would choose.\nApparently, I was only supposed to name one, not two.",
    "Went to the sperm clinic earlier\nThe lady asked if I'd like to masturbate in the cup\nI said 'I'm good but not ready for competition yet'",
    "'Mom, why didn't you vaccinate me?'\n'I didn't want you to get autism, honey.'\n'Thanks mom. I could have not survived having autism and polio at the same time.'",
    "I refused to believe I was gay and dyslexic.\nI was in Daniel.",
    "I injured myself during an Ironman marathon the other day.\nGot up too fast after watching the third film",
    "The only idea that flat-earthers fear\nis sphere itself.",
    "I tried to share a bag of chips with a homeless person on the street.\nHe told me to fuck off and buy my own.",
    "What does my asshole and my Toyota have in common?\nThey're both leaking tranny fluid.",
    "I was at a restaurant the other day when I heard the waitress scream, 'Does anyone know CPR?'\nI yelled back, 'I know the whole alphabet.'\n\nEveryone laughed. Well, except this one guy.",
    "This morning, I decided to wake up my girlfriend with a gentle fuck\nfollowed by a gentle 'you'",
    "How do stoners propose to one another?\nMarriage, you wanna?",
    "I'm an agnostic, an insomniac, and a dyslexic\nEvery night I lie awake wondering if there really is a dog.",
    "What gets longer if pulled, fits snugly between breasts, slides neatly into a hole, chokes people when used incorrectly, and works well when jerked?\nA seatbelt",
    "Yesterday, I accidentally sent a naked picture of myself to everyone in my address book.\nNot only was it embarrassing but it cost a fortune in stamps.",
    "I accidentally swallowed two pieces of string today and they came out tied together\nI shit you knot",
    "If you're single and you know it, use your hands",
    "My doctor wrote me a prescription for dailysex\n...but my girlfriend insists it says dyslexia.",
    "I signed up for binary 101\nbut it turns out it's a level 5 course",
    "I didn't know what to wear to my Premature Ejaculation Society meeting,\nso I just came in my pants.",
    "I made a graph of my past relationships.\nIt has an ex axis and a why axis.",
    "My wife asked me to get her something that goes from 0 to 200 in six seconds for her birthday.\nSo I got her a bathroom scale.",
    "My boss appointed me to be his sexual advisor. His exact words were 'When I want your fucking advice, I'll ask for it'.",
    "What's the difference between weed and pussy?\nIf you can smell weed from across the room that means it's good",
    "If I had a dollar for every time a girl didn't find me attractive...\nGirls would find me attractive",
    "What's worse than a lobster on your piano?\nCrabs on your organ.",
    "I wanted to die, but then I got a job.\nNow I really want to die.",
    "A leaf and a emo fall of a tree, Guess who hits ground first?\nThe leaf, the rope stopped the emo.",
    "Life is like a penis.\nIt's all relaxed freely hanging, and then a woman comes and makes it hard.",
    "A Vagina is like a paperclip\nTight and useful until you start putting bigger things in it.",
    "What does a stripper do with her asshole before she goes to work?\nShe drops him off at band practice.",
    "I am registered as a sex offender\n...but where do I log in?",
    "Why do so many lesbians have short hair?\nThey just get really excited about scissors.",
    "When a deaf girl jacks you off\nIt's technically oral",
    "I am officially a pussy magnet\nMagnets repel too",
    "I just read that someone in New York gets stabbed every 52 seconds. Poor guy.",
    "“I'm sorry” and “I apologize” mean the same thing. Except at a funeral.",
    "When my son said, “Dad, did you get the results of the DNA test back?”\n\nI said, “Call me George.”",
    "My husband and I have reached the difficult decision that we do not want children. If anybody does, please just send me your contact details and we can drop them off tomorrow.",
    "If you were born in September, it's pretty safe to assume that your parents started their new year with a bang.",
    "I was drinking a martini and the waitress screamed “does anyone know CPR?” I yelled, “I know the entire alphabet” and we all laughed and laughed. Well, except for one person.",
    "I visited my new friend in his apartment. He told me to make myself at home. So I threw him out. I hate having visitors.",
    "My girlfriend dumped me, so I stole her wheelchair. Guess who came crawling back?",
    "My wife keeps telling me, “I want another baby.”\n\nIt's a relief, I really don't like this one either.”",
    "The priest said, “Do you have any last requests?”\n\nThe murderer sitting in the electric chair replied, “Yes. Can you please hold my hand?”",
    "Why are cigarettes good for the environment?\n\nThey kill people.",
    "I sent my husband to the store for potatoes, and he was hit by a car.\n\n\"That's horrible! And what are you going to do now?\" my friend asked. \n\nDon't know. Rice, probably.",
    "Option 1: Let's eat grandma.\n\nOption 2: Let's eat, grandma.\n\nThere you have it. Proof that punctuation saves lives.",
    "You're not completely useless. You can always be used as a bad example.",
    "My girlfriend's dog died, so I bought her another, identical one. She just screamed at me and said: “What am I meant to do with two dead dogs?!?”",
    "I bought my blind friend a cheese grater for his birthday. He later told me it was the most violent book he'd ever read.",
    "I tried to warn my son about playing Russian roulette. It went in one ear and out the other.",
    "What's the process of applying for a job at Hooters?\n\nThey just give you a bra and say, \"Here, fill this out.\"",
    "The guy who stole my diary just died. My thoughts are with his family.",
    "They laughed at my crayon drawing. I laughed at their chalk outline.",
    "My mom died when we couldn't remember her blood type. As she died, she kept telling us to 'be positive,' but it's hard without her.",
  "Today, I asked my phone 'Siri, why am I still single?' and it activated the front camera.",
  "Today, on a drive, I decided to go visit my childhood home. I asked the people living there if I could come inside because I was feeling nostalgic, but they refused and slammed the door in my face. My parents are the worst.",
  "I just came across my wife's Tinder profile and I'm so angry about her lies. She is not 'fun to be around.'",
  "Dark humor is like food. Not everyone gets it.",
  "The doctor gave me one year to live, so I shot him with my gun. The judge gave me 15 years. Problem solved.",
  "My senior relatives liked to tease me at weddings, saying things like, 'You'll be next!' They stopped once I started doing the same to them at funerals.",
  "My grief counselor died. He was so good, I don't even care."
  ];

  const compliments = [
    "You're like human sunshine!",
    "You're more fun than bubble wrap.",
    "Your smile is proof that the best things in life are free.",
    "You're so adorable, you make puppies jealous.",
    "You're like the frosting on my birthday cake – sweet and all over the place!",
    "If you were a vegetable, you'd be a cute-cumber!",
    "You're someone's reason to smile, probably a lot of someones.",
    "You're better than a triple-scoop ice cream cone. With sprinkles.",
    "Your laughter is the best soundtrack.",
    "You're more fun than a water slide on a hot summer day.",
    "You're the human equivalent of a surprise pizza.",
    "If life is a game, you're winning.",
    "You're the kind of person who makes everyone look forward to Mondays.",
    "You're like the get-out-of-jail-free card in Monopoly, but for bad days.",
    "You bring out the best emojis in me.",
    "You're as cool as a vintage cassette tape.",
    "If you were a fruit, you'd be a fine-apple.",
    "You're the reason Santa even has a naughty list.",
    "You're like a breath of fresh air in a submarine.",
    "Your face makes other people look dull.",
    "You're as fun as a hot tub full of puppies.",
    "You're more magical than a unicorn farting rainbows.",
    "Your smile could light up a room full of grumpy people.",
    "You're more mysterious than the dark side of the moon.",
    "If you were a day of the week, you'd be Saturday.",
    "You're the cherry on top of a perfect day.",
    "Your hair looks like a flock of golden retrievers.",
    "You're like the end piece of a loaf of bread – everyone's secret favorite part.",
    "You're the human version of a Labrador puppy.",
    "You're like an espresso shot for my mood.",
    "You're like a keyboard: you put the 'write' in right.",
    "If you were a color, you'd be a rainbow.",
    "You're more unique than a snowflake in a snowstorm.",
    "You're the pop in my tart.",
    "You're the 'skip intro' button on Netflix but for bad days.",
    "You're the exclamation mark in the happiest sentence I could ever write.",
    "You're the only person I know who can make a cardboard box look like a good investment.",
    "You're more mysterious than the hidden flavors in a pack of Skittles.",
    "Your creativity is like a box of fireworks: colorful, explosive, and likely to cause a sensation.",
    "You're like a real-life superhero, but with less spandex.",
    "You're the reason I put my phone down and look around.",
    "You're like a human charger, I get energized just by being near you.",
    "Are you a magician? Because whenever I look at you, everyone else disappears.",
    "Your voice is more soothing than my favorite playlist.",
    "I bet you make puppies smile.",
    "You're so cool, penguins get jealous.",
    "If sarcasm was a skill, you'd be a legend.",
    "You're not someone I pretend not to see in public.",
    "You're like the human version of a comfort food.",
    "You're like sunshine on a rainy day.",
    "Your face makes other people ugly.",
    "I'd choose sitting in traffic with you over a road trip with anyone else.",
    "You're more unique than a snowflake. And not just because you're cold and icy.",
    "If being awesome was a crime, you'd be serving a life sentence.",
    "You're so charming, you could convince me to build a snowman in July.",
    "You're not old, you're just... retro.",
    "You age like fine wine, which is to say, with a lot of complexity and depth.",
    "If you were a dog, you'd be the best.",
    "If laughter is the best medicine, your face must be curing the world.",
    "You're more fun than a pool filled with jello.",
    "You're like the missing sock I've been looking for.",
    "You're more helpful than a pocket on a shirt.",
    "If you were a potato, you'd be a sweet one.",
    "You have the kind of beauty that made Leonardo da Vinci wish he were still alive.",
    "Your creativity is like Halloween: a little scary, but mostly fun.",
    "You're the kind of friend who makes every day feel like Friday.",
    "You're cooler than a vintage cassette.",
  ];

  const spanish = [
    "Eres la razón por la que miro mi teléfono menos y alrededor más.",
    "Si fueras una verdura, serías un 'encantador'.",
    "Eres como un cargador humano, me energizo solo de estar cerca de ti.",
    "¿Eres mago? Porque cuando te veo, todo lo demás desaparece.",
    "Tu voz es más relajante que mi lista de reproducción favorita.",
    "Apuesto a que haces sonreír a los cachorros.",
    "Eres tan genial que los pingüinos se ponen celosos.",
    "Si el sarcasmo fuera una habilidad, serías una leyenda.",
    "No eres alguien a quien pretendo no ver en público.",
    "Eres más divertido que una piscina de pelotas llena de caramelos.",
    "Si fueras una fruta, serías una piña.",
    "Eres como la versión humana de la comida reconfortante.",
    "Eres como el sol en un día lluvioso.",
    "Eres el tipo de persona que podría hacer sonreír incluso a Kanye.",
    "Tu cara hace que los demás parezcan feos.",
    "Preferiría estar atascado en el tráfico contigo que en un viaje por carretera con alguien más.",
    "No eres perezoso, solo estás en modo de ahorro de energía.",
    "Eres más único que un copo de nieve. Y no solo porque eres frío y helado.",
    "Si ser increíble fuera un delito, estarías cumpliendo cadena perpetua.",
    "Tus rarezas son tan tú, y me encanta eso.",
    "Cuando te miro, siento una calidez en mi corazón. O tal vez sea solo acidez.",
    "Eres tan encantador que podrías convencerme de construir un muñeco de nieve en julio.",
    "No estás viejo, solo eres... retro.",
    "Eres mi persona favorita para ser socialmente incómodo.",
    "Eres como el pedazo final de pan en una bolsa: el favorito secreto de todos.",
    "Tu sonrisa es la prueba de que lo mejor de la vida es gratis.",
    "No eres bajo, simplemente estás más cerca de la tierra que otras personas.",
    "Envejeces como el buen vino, lo que significa, con mucha complejidad y profundidad.",
    "Si fueras un perro, serías el mejor chico/chica.",
    "Eres la razón por la que alguien sonríe.",
    "Si la risa es la mejor medicina, tu cara debe estar curando el mundo.",
    "Eres más divertido que una piscina llena de gelatina.",
    "Eres como el calcetín perdido que he estado buscando.",
    "Eres más útil que un bolsillo en una camisa.",
    "Si fueras una papa, serías una dulce.",
    "Tienes el tipo de belleza que hizo que Leonardo da Vinci deseara seguir vivo.",
    "Tu creatividad es como Halloween: un poco aterradora, pero mayormente divertida.",
    "Eres el 'Ctrl + Z' en un mundo lleno de 'Shift + Delete'.",
    "Eres el tipo de amigo que hace que cada día se sienta como viernes.",
    "Eres más genial que un casete vintage.",
    "Eres el despertador más adorable.",
    "Si fueras un libro, serías imposible de dejar.",
    "Eres como un soplo de aire fresco en un submarino.",
    "Tus chistes son tan malos que son buenos.",
    "Si fueras una pizza, serías suprema.",
    "Eres el WiFi de mi conexión a internet.",
    "Tu optimismo es más contagioso que una pista de risas.",
    "Eres más misterioso que mi historial de navegación.",
    "Si fueras un color, serías un arcoíris.",
    "Eres como mi propio orador motivacional personal.",
    "Eres como un rayo de sol en persona.",
    "Eres más divertido que una burbuja de jabón.",
    "Eres tan adorable que hasta los cachorros te tienen envidia.",
    "Si fueras una caja de crayones, serías la grande de marca con sacapuntas incorporado.",
    "Eres como la cobertura en mi pastel de cumpleaños: dulce y por todos lados.",
    "Si fueras un vegetal, serías un encantador.",
    "Eres la razón por la que alguien sonríe, probablemente muchas personas.",
    "Eres mejor que un cono de tres bolas de helado. Con chispitas.",
    "Tu risa es la mejor banda sonora.",
    "Podrías hacer que un ciego viera con tu brillo.",
    "Eres más divertido que un tobogán de agua en un día caluroso.",
    "Si fueras una vela aromática, te llamarían Perfectamente Imperfecto (y olerías a verano).",
    "Eres el equivalente humano de una pizza sorpresa.",
    "Eres tan delicioso como un reembolso inesperado en una compra.",
    "Si la vida es un juego, tú estás ganando.",
    "Eres el tipo de persona que hace que todos esperen con ansias los lunes.",
    "Tu presencia es como encender las luces brillantes en una habitación llena de cachorros.",
    "Eres como la carta de salir de la cárcel gratis en el Monopoly, pero para los malos días.",
    "Sacar lo mejor de los emojis en mí.",
    "Eres tan genial como una cinta de casete vintage.",
    "Eres la razón por la que Santa tiene una lista de traviesos.",
    "Eres la 'nada' que respondo cuando me preguntan en qué estoy pensando.",
    "Tu cara hace que otras personas se vean aburridas.",
    "Eres como un choque de manos en la cara con felicidad.",
    "Eres tan divertido como una bañera de hidromasaje llena de cachorros.",
    "Eres más mágico que un unicornio expulsando arcoíris.",
    "Si fueras un guiño, serías un destello en el cielo nocturno de alguien.",
    "Tu sonrisa podría iluminar una habitación llena de gente gruñona.",
    "Eres más misterioso que el lado oscuro de la luna.",
    "Si fueras un día de la semana, serías sábado.",
    "Eres la cereza en la cima de un día perfecto.",
    "Tu cabello parece un rebaño de golden retrievers.",
    "Eres como el pedazo final de una barra de pan: la parte secreta favorita de todos.",
    "Eres la versión humana de un cachorro labrador.",
    "Eres como un shot de espresso para mi estado de ánimo.",
    "Eres como un teclado: pones el 'escribir' en lo correcto.",
    "Eres más único que un copo de nieve en una tormenta de nieve.",
    "Eres el estallido en mi tarta pop.",
    "Eres el botón de 'saltar intro' en Netflix, pero para los malos días.",
    "Eres el signo de exclamación en la oración más feliz que podría escribir.",
    "Eres tan intrigante como el giro de la trama en una película de Quentin Tarantino.",
    "Eres la única persona que conozco que puede hacer que una caja de cartón parezca una buena inversión.",
    "Eres más misterioso que los sabores ocultos en un paquete de Skittles.",
    "Tu creatividad es como una caja de fuegos artificiales: colorida, explosiva y probablemente cause sensación.",
    "Eres el pegamento en un mundo lleno de clips de papel.",
    "Eres como un superhéroe de la vida real, pero con menos spandex."
  ];

  const wisdom = [
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "In three words I can sum up everything I've learned about life: it goes on. - Robert Frost",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "The only thing we have to fear is fear itself. - Franklin D. Roosevelt",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
    "Life is really simple, but we insist on making it complicated. - Confucius",
    "The only constant in life is change. - Heraclitus",
    "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
    "Don't count the days, make the days count. - Muhammad Ali",
    "The journey of a thousand miles begins with one step. - Lao Tzu",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "To succeed in life, you need two things: ignorance and confidence. - Mark Twain",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
  ];



  useEffect(() => {
    // Determine the username and select the appropriate text array
    const email = Cookies.get('email');
    if (email) {
      const username = email.split('@')[0].toLowerCase();
      let selectedArray = wisdom; // Default selection
      if (['bill', 'randall'].includes(username)) {
        selectedArray = jokes;
      } else if (['sam', 'vitaliy', 'rhonda', 'juliya'].includes(username)) {
        selectedArray = compliments;
      } else if (username === 'jose') {
        selectedArray = spanish;
      }

      const randomIndex = Math.floor(Math.random() * selectedArray.length);
      let compliment;
      // Prepare the text for typing, including the username if it's the first compliment
      if (username) {
      compliment = `${username.charAt(0).toUpperCase() + username.slice(1)}, ${selectedArray[randomIndex]}`;
      } else {
        compliment = selectedArray[randomIndex];
      }
      setCompliment(compliment);
      
    }
  }, []);



  const handleLoginClick = () => {
    router.push('/login'); // Navigate to the login page
  };
  return (
    <div className="h-screen w-full p-5 flex justify-center items-center">
      <div>
      <Fade delay={100} cascade damping={10} >
      <p className="text-gray-900 text-lg font-light text-center">{compliment}</p>
      </Fade>
    <div className="flex justify-center items-center">
            <button
            className="bg-gray-800 hover:bg-black text-white rounded-md py-1 px-2 w-full mt-5"
            onClick={handleLoginClick}
          >
            Login
          </button>
        
          </div>
          </div>
          </div>
  );
};

export default Logout;

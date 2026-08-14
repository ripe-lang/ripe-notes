---
status: draft
area: philosophy
updated: 2026-08-14
---
What do I want Ripe to be?

Ripe is a systems language where the compiler does the **bookkeeping** and the **programmer makes the decisions**. 

The simplest answer is type inference. The compiler knows that the right hand side is an integer.

```ripe
var x = 5
```

But you have the full control of the language to decide when you want to create or destroy objects. 

Also, **minimalism** is the second highest priority to have easy of use of a high level language but the control of a low level one, so safety is a priority.

## New feature

Before I add a new feature to Ripe, I have to three rules that have to hold, otherwise it belongs in a library or another language.

1. It removes work the compiler can do reliably.
2. It keeps the program's behavior obvious.
3. It preserves direct control when the programmer needs it.

No more the days where you have to count how many characters are in “Hello”, no more hidden surprises,  and you have full control over the language. Well none of this is new, however, I’m trying to stick to these principals for my own language.

## Every feature works with every other feature

What the title says. If I implement strings in my language they should be be able to interact with structs, enums, local inference, etc. I’m not going to restrict myself by saying it’s the compiler or parser structure because that just calls for a rewrite. I need to have an actual reason from the looking closely at the schematics and how it will behaves with the language. 

The only thing I have to watch for is that the new declaration get an explicit placement rule and that every new expression is checked in every position that accepts a value.

## Intuition beats cleverness

One of the things that I first did when starting this language was thinking about ways to make this language unique. What a waste of time. Programming languages have been around for decades and people are use to a certain way of writing things. I had the idea of using `^` for pointers but I’m mainly use C so why would I change something that I’m use to.

However, this is pretty limited thinking because no innovation comes from this. Well, I’m not inventing some new, but I think expression oriented languages  just make sense. Why am I not allowed to write:

```ripe
var x = if x > 5 { 5 } else { 3 }
``` 

In the end you’re either returning some value, variable, or a function that has it’s own value. 

The point is that you can write it without stopping. If a thing needs a trip to the docs to use the second time then it failed. This is why so much is an expression and why more thing should be first class. 

## Speed is a feature

Software is getting slower and a compiler are no different. I am making the effort even this early to keep my compiler  fast by making deliberate choices of the way I write my code in Ocaml, so using tail recursion heavily or cutting down the `Hashtbl` innovations. There will be some overhead because I won’t be writing my own assembler or linker but I can still make the attempt.

I don’t have this problem now, but a slow compiler changes how people write. You end up batching up a bunch of changes and stop trying thing and stop running the test. 

## Function names

The UNIX creators loved shortening every name () [creat](https://man7.org/linux/man-pages/man3/creat.3p.html) without a `e`!), so you end up having to dig through man pages for the function you need. We have IDEs and text editors with intellisense, so hopefully in my standard library I’ll have a descriptive naming scheme.

## Finishing what I start

This has to do with a bit with intuition beats cleverness. A language becomes difficult to use when you are asked to spell things out and remember its gaps. I recently implemented ranges (`a[1..3]`) into my language. I covered every possible case `[..=3]`. I believe a feature covering most of its own cases is worse than one covering none, because now there is a line to memorize about which half works. 

A good test is going to be whether somebody can guess. If they can guess the shape from one they already know then it should work, and if it doesn't that is a bug in the language not their expectations.
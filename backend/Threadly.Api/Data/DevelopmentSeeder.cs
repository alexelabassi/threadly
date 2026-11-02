using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Threadly.Api.Models;

namespace Threadly.Api.Data;

public static class DevelopmentSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        // Migrations are an explicit setup step; seeding never changes the schema.
        if (await db.Database.GetPendingMigrationsAsync() is var pending && pending.Any())
            throw new InvalidOperationException("Apply EF migrations before starting: dotnet ef database update --project backend/Threadly.Api");

        string[] names = ["oliver_chen", "maya_designs", "alex_morgan", "sophia_reads"];
        var authors = new List<ApplicationUser>();
        foreach (var name in names)
        {
            var user = await users.FindByNameAsync(name);
            if (user is null)
            {
                user = new ApplicationUser { Id = Guid.NewGuid(), UserName = name, Email = $"{name}@example.test", CreatedAt = DateTime.UtcNow.AddDays(-42 - authors.Count * 11) };
                var result = await users.CreateAsync(user, "ThreadlyDemo2026!");
                if (!result.Succeeded) throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
            }
            authors.Add(user);
        }

        (string Title, string Content)[] samples = [
            ("The internet feels smaller when you find your people.", "I used to think the best thing about the internet was having access to everything. Lately, I think it’s finding a few people who care about the same oddly specific things you do.\n\nA thoughtful post, a shared perspective, a small idea that stays with you all day. Those little moments make a big place feel a little more human.\n\nHere’s to more of those moments. What’s something you’ve been thinking about lately?"),
            ("A small reminder: you’re allowed to be a beginner.", "Started learning pottery last month. My first bowl looks like it’s been through a minor natural disaster, and honestly? I love it.\n\nThere’s something freeing about doing something you’re not good at, simply because you enjoy it. No portfolio, no side hustle, no pressure to turn it into anything.\n\nMake the wonky bowl. Write the messy first draft. Start somewhere."),
            ("What building my first side project actually taught me", "It wasn’t the framework. It wasn’t the perfect folder structure. It was learning to make something small, finish it, and put it in front of another person.\n\nI spent two weeks choosing a stack and one weekend building the actual idea. Next time I’m reversing that ratio.\n\nMy new rule: if I can’t describe the first version in one sentence, it’s probably too big."),
            ("I traded my morning scroll for twenty pages", "Nothing dramatic. Just a book where my phone used to be, and twenty pages before the day begins.\n\nThree weeks in, mornings feel a little quieter. I’m currently reading A Psalm for the Wild-Built and taking my time with it.\n\nIf you’ve found a small habit that makes your day better, I’d love to read about it in a post of your own."),
            ("Good design is often just knowing what to leave out", "I removed half the elements from a dashboard I’ve been working on. Somehow it became twice as useful.\n\nEvery button asks for attention. Every label asks to be read. Being intentional about what earns that space is probably the most valuable skill I’m learning."),
            ("The best part of a walk is having nowhere to be", "Took the long way home today. Found a tiny bookshop, a very opinionated cat, and the best patch of afternoon light.\n\nA reminder to myself that not every hour needs an output. Sometimes getting a little lost is the whole point."),
            ("A love letter to the humble README", "A good README is hospitality for developers. It says: here’s what this is, here’s how to make it work, and here’s where you can help.\n\nSpent an afternoon improving ours and our newest teammate was up and running in fifteen minutes. That felt better than shipping another feature."),
            ("Making room for a little creative boredom", "I’ve started leaving my headphones at home for short errands. The first few minutes feel strange, then my brain starts making its own entertainment.\n\nSome of my favorite ideas this month arrived somewhere between the grocery store and my front door."),
            ("The tiny joy of making something with friends", "Our group project finally runs on everyone’s machine. There were celebrations. There may have been cake.\n\nLearning to explain your decisions, ask for help early, and leave the code a little clearer for the next person is a project of its own."),
            ("You don’t need a perfect desk to do meaningful work", "My favorite thing I made this year started at the kitchen table, between a cold coffee and a pile of laundry.\n\nA nice workspace helps. A little curiosity, a bit of time, and the willingness to begin help more.")
        ];
        for (var i = 0; i < samples.Length; i++)
        {
            var (title, content) = samples[i];
            var author = authors[i % authors.Count];
            if (!await db.Posts.AnyAsync(p => p.Title == title && p.AuthorId == author.Id))
                db.Posts.Add(new Post { Title = title, Content = content, AuthorId = author.Id, CreatedAt = DateTime.UtcNow.AddHours(-2 - i * 5) });
        }
        await db.SaveChangesAsync();
    }
}

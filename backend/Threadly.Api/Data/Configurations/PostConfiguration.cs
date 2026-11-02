using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Threadly.Api.Models;

namespace Threadly.Api.Data.Configurations;

public sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Content).HasMaxLength(20000).IsRequired();
        builder.HasOne(p => p.Author).WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(p => new { p.CreatedAt, p.Id }).IsDescending();
        builder.HasIndex(p => new { p.AuthorId, p.CreatedAt, p.Id });
    }
}

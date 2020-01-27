#
# A script to autogenerate entries in the main feed from the Simplecast API
#
#

require 'net/http'
require 'uri'
require 'json'
require 'date'

API_KEY = ENV["SIMPLECAST"]
#CAST_ID = ENV["pie"]
CAST_ID = '7ff2cd28-a418-4f48-96bd-cb9a534cd3db'

uri = URI.parse("https://api.simplecast.com/podcasts/#{CAST_ID}/episodes")
request = Net::HTTP::Get.new(uri)

headers = {
  'Authorization'=>"Bearer #{API_KEY}",
  use_ssl: uri.scheme == "https"
}

response = Net::HTTP.start(uri.hostname, uri.port, headers) do |http|
  http.request(request)
end

counter = 0
# fetch existing titles
existing_episodes = Dir["./_posts/*"].map {|e| e.gsub(/.\/_posts\/\d{4}-\d{2}-\d{2}-/, '')
                                            .gsub('.md', '')}

JSON.parse(response.body)['collection'].each do |episode|
  next unless episode['status']['published']
  # check if it exists, we can't do the exact path matching,
  # Simplecast was returning inconsistent dates
  title = episode['title']
  puts existing_episodes.include? title
  next if existing_episodes.include? title

  # generate file name
  date = Date.parse episode['published_at']
  file_name = "./_posts/#{date}-#{title.gsub('/', '-')}.md"

  # make a new request for long description
  uri = URI.parse(episode['href'])
  request = Net::HTTP::Get.new(uri)
  ep_response = Net::HTTP.start(uri.hostname, uri.port, headers) do |http|
    http.request(request)
  end

  corrected_text =
    JSON.parse(ep_response.body)['long_description']
    .gsub(/(?<!\[\d\]:)(?<!\[\d\]: )http.*?[\r \n [:blank:]]/) do |m|
    site = m.split('/')[2]
    "[#{site}](#{m})"
  end

  # write file from template
  File.binwrite(file_name, <<STRING)
---
layout: episode_v3
simplecastId: #{episode['id']}
title: "#{title}"
sharing_token: #{episode['id']}
description: #{episode['description']}
---

#{corrected_text}
STRING

  counter += 1
  puts "Added #{file_name}"
end
puts "#{counter} episodes added"
exit(0) if counter > 0
exit(100)


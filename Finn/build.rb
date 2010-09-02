require 'pp'
require 'chunky_png'

$save = %W{ document }
$symbolMap = {}

$symChars = [
		'_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 
		'_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	]

def symbol(sym)
	return if $symbolMap.has_key? sym or $save.include? sym
	
	i = $symbolMap.size
	
	name = ''
	while i != 0 or name.size == 0
		chars = $symChars[if name.size == 0 then 0 else 1 end]
		name += chars[i % chars.size]
		i /= chars.size
	end
	
	$symbolMap[sym] = name
end

def bake(source)
	strings = {}
	i = 0
	while i < source.size
		if source[i] == '\'' or source[i] == '"'
			str = source[i]
			loop do
				i += 1
				str += source[i]
				if source[i] == '\\' and source[i+1] == str[0]
					str += str[0]
					i += 1
				elsif source[i] == str[0]
					i += 1
					break
				end
			end
			strings[str] = "$STR#{strings.size}$"
		else i += 1
		end
	end
	
	strings.each do |k, v|
		source.gsub! k, v
	end
	
	source = source.gsub(/[\n\r]/, '')
	.gsub(/\t/, ' ')
	.gsub(/[ ]+/, ' ')
	.gsub(/([~+<>,.\/\-=\[\]{}!@#$\%^&*()|;:?]) ([~+<>,.\/\-=\[\]{}!@#$\%^&*()_|;:?])/m, '\1\2')
	.gsub(/([~+<>,.\/\-=\[\]{}!@#$\%^&*()|;:?]) ([a-zA-Z_0-9])/m, '\1\2')
	.gsub(/([a-zA-Z_0-9]) ([~+<>,.\/\-=\[\]{}!@#$\%^&*()|;:?])/m, '\1\2')
	.gsub(';}', '}')
	.gsub(/;$/, '')
	.gsub(/(^|[^a-zA-Z0-9_])var /, '\1')
	
	source.scan(/(^|[^a-zA-Z0-9_.])([a-zA-Z_][a-zA-Z0-9_]*)=/).each do |_, sym| symbol sym end
	source.scan(/function( [a-zA-Z_][a-zA-Z0-9_]*)?\((.*?)\)/).each do |name, args|
		symbol name[1...name.size] if name != nil
		args.split(',').each do |sym| symbol sym.strip end
	end
	
	haxMap = {}
	$symbolMap.each do |k, v|
		nsym = "$SYM#{haxMap.size}$"
		source.gsub! /(^|[^a-zA-Z_0-9\.])#{Regexp.quote k}($|[^a-zA-Z0-9_])/, "\\1#{nsym}\\2"
		source.gsub! /(^|[^a-zA-Z_0-9\.])#{Regexp.quote k}\./, "\\1#{nsym}."
		haxMap[nsym] = v
	end
	
	haxMap.each do |k, v|
		source.gsub! k, v
	end
	
	strings.each do |k, v|
		source.gsub! v, k
	end
	
	#source.gsub! ';', ";\n"
	#source.gsub! '{', "{\n"
	#source.gsub! '}', "}\n"
	
	source
end

def rollPng(fn, data)
	png = ChunkyPNG::Image.new(data.size, 1)
	(0...(data.size)).each do |i|
		png[i, 0] = ChunkyPNG::Color.grayscale data[i].ord
	end
	
	png.save fn, :color_mode => ChunkyPNG::COLOR_GRAYSCALE, :compression => 9
end

preloader = bake File.open('preload.js', 'rb').read # Must be baked first to give it the smallest variables!
osource = Dir.glob('*.js').map { |fn| if fn == 'preload.js' then '' else File.open(fn).read() end }.join ''
puts "Original JS size: #{osource.size}"
source = bake osource

File.open('data/0', 'wb') do |fp|
	fp.write source
end

archive = Dir.glob('data/*').map { |fn| File.open(fn, 'rb').read }
data = archive.size.chr
archive.each do |elem|
	data += (elem.size >> 8).chr
	data += (elem.size & 0xFF).chr
	data += elem
end
rollPng('data.png', data)
comp = File.open('data.png', 'rb').read.size
puts "Pre compression archive: #{data.size}"
puts "Post compression archive: #{comp}"

File.open('finn.html', 'wb') do |fp|
	skeleton = File.open('skeleton.html', 'rb').read
	skeleton.gsub! '%code%', preloader
	skeleton.gsub! '%complen%', data.size.to_s
	fp.write skeleton
	puts "Skeleton + preloader: #{skeleton.size}"
	puts "Total size: #{skeleton.size + comp}"
end
